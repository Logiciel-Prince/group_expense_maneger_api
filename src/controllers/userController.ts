import { Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const userController = {
  // Search users by email
  searchUsers: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.query;

      if (!email) {
        throw new AppError('Email query parameter is required', 400);
      }

      const users = await User.find({
        email: { $regex: email, $options: 'i' },
      })
        .select('name email avatar')
        .limit(10);

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to search users', 500);
    }
  },
};
