import { NextFunction, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z, ZodError } from 'zod';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/ApiError';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'sales']).optional().default('sales'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const getFirstValidationMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Invalid request body';
  }

  return 'Invalid request body';
};

const createToken = (id: string, role: 'admin' | 'sales'): string => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
  );
};

const buildUserResponse = (user: { _id: unknown; name: string; email: string; role: 'admin' | 'sales' }) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = registerSchema.parse(req.body);
    const normalizedEmail = parsedBody.email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(parsedBody.password, 10);
    const user = await User.create({
      name: parsedBody.name,
      email: normalizedEmail,
      password: hashedPassword,
      role: parsedBody.role,
    });

    const token = createToken(String(user._id), user.role);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return next(new ApiError(400, getFirstValidationMessage(error)));
    }

    return next(error);
  }
};

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = loginSchema.parse(req.body);
    const normalizedEmail = parsedBody.email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(parsedBody.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = createToken(String(user._id), user.role);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return next(new ApiError(400, getFirstValidationMessage(error)));
    }

    return next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authorized, no token');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return res.status(200).json({
      success: true,
      data: buildUserResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};
