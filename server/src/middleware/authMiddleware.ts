import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/ApiError';

interface JwtPayload {
  id: string;
  role: 'admin' | 'sales';
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Not authorized, no token');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.user = {
      id: payload.id,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
