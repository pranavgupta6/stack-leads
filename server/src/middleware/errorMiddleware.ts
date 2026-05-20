import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ success: false, message: 'Validation error' });
  }

  // Mongoose CastError -> Resource not found
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }

  // JWT errors
  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err instanceof TokenExpiredError) {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Duplicate key error
  // @ts-ignore
  if (typeof err === 'object' && err && (err as any).code === 11000) {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};
