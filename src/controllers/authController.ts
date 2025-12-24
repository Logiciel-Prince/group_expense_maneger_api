import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const googleClient = new OAuth2Client(config.google.clientId);

export const authController = {
  // Google OAuth login
  googleLogin: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        throw new AppError('ID token is required', 400);
      }

      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new AppError('Invalid token payload', 400);
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!email || !name) {
        throw new AppError('Email and name are required', 400);
      }

      // Find or create user
      let user = await User.findOne({ googleId });

      if (!user) {
        // Create new user
        user = await User.create({
          googleId,
          email,
          name,
          avatar: picture || '',
        });
      } else {
        // Update user info if changed
        user.name = name;
        user.avatar = picture || '';
        await user.save();
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiresIn,
        }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            googleId: user.googleId,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Google login error:', error);
      throw new AppError('Authentication failed', 401);
    }
  },

  // Get current user
  getCurrentUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await User.findById(req.user.id).select('-__v');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            googleId: user.googleId,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch user', 500);
    }
  },

  // Logout (client-side token removal)
  logout: async (req: AuthRequest, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  },
};
