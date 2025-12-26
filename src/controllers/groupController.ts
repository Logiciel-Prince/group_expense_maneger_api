import { Response } from 'express';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from "../middleware/auth";

export const groupController = {
  // Create a new group
  createGroup: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      const userId = req.user!.id;

      const group = await Group.create({
        name,
        createdBy: userId,
        members: [userId],
      });

      const populatedGroup = await Group.findById(group._id)
        .populate('createdBy', 'name email avatar')
        .populate('members', 'name email avatar');

      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: { group: populatedGroup },
      });
    } catch (error) {
      throw new AppError('Failed to create group', 500);
    }
  },

  // Get all groups for current user
  getUserGroups: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const groups = await Group.find({
        members: userId,
      })
        .populate('createdBy', 'name email avatar')
        .populate('members', 'name email avatar')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { groups },
      });
    } catch (error) {
      throw new AppError('Failed to fetch groups', 500);
    }
  },

  // Get group by ID
  getGroupById: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const group = await Group.findById(id)
        .populate('createdBy', 'name email avatar')
        .populate('members', 'name email avatar');

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      // Check if user is a member
      const isMember = group.members.some(
        (member: any) => member._id.toString() === userId
      );

      if (!isMember) {
        throw new AppError('Access denied', 403);
      }

      res.status(200).json({
        success: true,
        data: { group },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch group', 500);
    }
  },

  // Update group
  updateGroup: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = req.user!.id;

      const group = await Group.findById(id);

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      // Only creator can update group
      if (group.createdBy.toString() !== userId) {
        throw new AppError('Only group creator can update group', 403);
      }

      group.name = name;
      await group.save();

      const updatedGroup = await Group.findById(id)
        .populate('createdBy', 'name email avatar')
        .populate('members', 'name email avatar');

      res.status(200).json({
        success: true,
        message: 'Group updated successfully',
        data: { group: updatedGroup },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update group', 500);
    }
  },

  // Delete group
  deleteGroup: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const group = await Group.findById(id);

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      // Only creator can delete group
      if (group.createdBy.toString() !== userId) {
        throw new AppError('Only group creator can delete group', 403);
      }

      await Group.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Group deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete group', 500);
    }
  },

  // Add member to group
  addMember: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const userId = req.user!.id;

      const group = await Group.findById(id);

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      // Only creator can add members
      if (group.createdBy.toString() !== userId) {
        throw new AppError('Only group creator can add members', 403);
      }

      // Find user by email
      const userToAdd = await User.findOne({ email: email.toLowerCase() });

      if (!userToAdd) {
        throw new AppError('User not found with this email', 404);
      }

      // Check if already a member
      const isAlreadyMember = group.members.some(
        (memberId) => memberId.toString() === userToAdd._id.toString()
      );

      if (isAlreadyMember) {
        throw new AppError('User is already a member', 400);
      }

      group.members.push(userToAdd._id);
      await group.save();

      const updatedGroup = await Group.findById(id)
        .populate('createdBy', 'name email avatar')
        .populate('members', 'name email avatar');

      res.status(200).json({
        success: true,
        message: 'Member added successfully',
        data: { group: updatedGroup },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to add member', 500);
    }
  },

  // Remove member from group
  removeMember: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id, userId: memberIdToRemove } = req.params;
      const userId = req.user!.id;

      const group = await Group.findById(id);

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      // Only creator can remove members
      if (group.createdBy.toString() !== userId) {
        throw new AppError('Only group creator can remove members', 403);
      }

      // Cannot remove creator
      if (memberIdToRemove === group.createdBy.toString()) {
        throw new AppError('Cannot remove group creator', 400);
      }

      group.members = group.members.filter(
        (memberId) => memberId.toString() !== memberIdToRemove
      );

      await group.save();

      const updatedGroup = await Group.findById(id)
        .populate('createdBy', 'name email avatar')
        .populate('members', 'name email avatar');

      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
        data: { group: updatedGroup },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to remove member', 500);
    }
  },
};
