import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { z, ZodError } from 'zod';
import { Lead } from '../models/Lead';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').trim(),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).default('New'),
  source: z.enum(['Website', 'Instagram', 'Referral']),
});

const updateLeadSchema = createLeadSchema.partial();

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

const getFirstValidationMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Invalid request body';
  }

  return 'Invalid request body';
};

const buildBaseQuery = (req: AuthenticatedRequest): Record<string, unknown> => {
  const { status, source, search } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};

  if (req.user?.role === 'sales') {
    query.createdBy = new mongoose.Types.ObjectId(req.user.id);
  }

  if (status && ['New', 'Contacted', 'Qualified', 'Lost'].includes(status)) {
    query.status = status;
  }

  if (source && ['Website', 'Instagram', 'Referral'].includes(source)) {
    query.source = source;
  }

  if (search && search.trim() !== '') {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  return query;
};

export const getLeads = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      sort = 'latest',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const query = buildBaseQuery(req);
    const sortOption: Record<string, 1 | -1> = sort === 'oldest'
      ? { createdAt: 1 }
      : { createdAt: -1 };

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('createdBy', 'name email role')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getLeadById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, 'Invalid lead ID');
    }

    const lead = await Lead.findById(id).populate('createdBy', 'name email role');
    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    if (req.user?.role === 'sales') {
      const createdById = (lead.createdBy as { _id?: mongoose.Types.ObjectId; toString?: () => string })._id
        ? String((lead.createdBy as { _id: mongoose.Types.ObjectId })._id)
        : String(lead.createdBy);

      if (createdById !== req.user.id) {
        throw new ApiError(403, 'Not authorized to view this lead');
      }
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    return next(error);
  }
};

export const createLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createLeadSchema.parse(req.body);

    if (!req.user?.id) {
      throw new ApiError(401, 'Not authorized, no token');
    }

    const newLead = await Lead.create({
      ...validatedData,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: newLead,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return next(new ApiError(400, getFirstValidationMessage(error)));
    }

    return next(error);
  }
};

export const updateLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, 'Invalid lead ID');
    }

    const validatedData = updateLeadSchema.parse(req.body);
    const lead = await Lead.findById(id);

    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      throw new ApiError(403, 'Not authorized to update this lead');
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: updatedLead,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return next(new ApiError(400, getFirstValidationMessage(error)));
    }

    return next(error);
  }
};

export const deleteLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, 'Invalid lead ID');
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      throw new ApiError(403, 'Not authorized to delete this lead');
    }

    await lead.deleteOne();

    return res.status(200).json({
      success: true,
      data: { message: 'Lead deleted successfully' },
    });
  } catch (error) {
    return next(error);
  }
};

export const exportLeads = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = buildBaseQuery(req);
    const leads = await Lead.find(query).sort({ createdAt: -1 });

    const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.status,
      lead.source,
      new Date(lead.createdAt).toLocaleDateString('en-IN'),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(','))
      .join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-export-${timestamp}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};