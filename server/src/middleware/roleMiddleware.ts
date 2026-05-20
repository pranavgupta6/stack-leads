import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/ApiError';

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        'You do not have permission to perform this action'
      );
    }

    next();
  };
};
