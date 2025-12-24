import { Response } from 'express';
import { Expense, ExpenseType } from '../models/Expense';
import { Group } from '../models/Group';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const expenseController = {
  // Create expense
  createExpense: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { groupId, title, amount, type, date } = req.body;
      const userId = req.user!.id;

      // Verify group exists and user is a member
      const group = await Group.findById(groupId);

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      const isMember = group.members.some(
        (memberId) => memberId.toString() === userId
      );

      if (!isMember) {
        throw new AppError('You are not a member of this group', 403);
      }

      const expense = await Expense.create({
        groupId,
        addedBy: userId,
        title,
        amount,
        type,
        date: date || new Date(),
      });

      const populatedExpense = await Expense.findById(expense._id)
        .populate('addedBy', 'name email avatar')
        .populate('groupId', 'name');

      res.status(201).json({
        success: true,
        message: 'Expense added successfully',
        data: { expense: populatedExpense },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create expense', 500);
    }
  },

  // Get all expenses for a group
  getGroupExpenses: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;
      const userId = req.user!.id;

      // Verify user is a member
      const group = await Group.findById(groupId);

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      const isMember = group.members.some(
        (memberId) => memberId.toString() === userId
      );

      if (!isMember) {
        throw new AppError('Access denied', 403);
      }

      const expenses = await Expense.find({ groupId })
        .populate('addedBy', 'name email avatar')
        .sort({ date: -1 });

      res.status(200).json({
        success: true,
        data: { expenses },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch expenses', 500);
    }
  },

  // Get monthly expenses for a group
  getMonthlyExpenses: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { month, year } = req.query;
      const userId = req.user!.id;

      // Verify user is a member
      const group = await Group.findById(groupId);

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      const isMember = group.members.some(
        (memberId) => memberId.toString() === userId
      );

      if (!isMember) {
        throw new AppError('Access denied', 403);
      }

      const query: any = { groupId };

      if (month && year) {
        query.month = parseInt(month as string);
        query.year = parseInt(year as string);
      }

      const expenses = await Expense.find(query)
        .populate('addedBy', 'name email avatar')
        .sort({ date: -1 });

      // Calculate summary
      const totalExpense = expenses
        .filter((e) => e.type === ExpenseType.EXPENSE)
        .reduce((sum, e) => sum + e.amount, 0);

      const totalIncome = expenses
        .filter((e) => e.type === ExpenseType.INCOME)
        .reduce((sum, e) => sum + e.amount, 0);

      const netAmount = totalExpense - totalIncome;

      res.status(200).json({
        success: true,
        data: {
          expenses,
          summary: {
            totalExpense,
            totalIncome,
            netAmount,
            count: expenses.length,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch monthly expenses', 500);
    }
  },

  // Update expense
  updateExpense: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, amount, type, date } = req.body;
      const userId = req.user!.id;

      const expense = await Expense.findById(id);

      if (!expense) {
        throw new AppError('Expense not found', 404);
      }

      // Only the person who added can update
      if (expense.addedBy.toString() !== userId) {
        throw new AppError('You can only update your own expenses', 403);
      }

      if (title) expense.title = title;
      if (amount) expense.amount = amount;
      if (type) expense.type = type;
      if (date) expense.date = new Date(date);

      await expense.save();

      const updatedExpense = await Expense.findById(id)
        .populate('addedBy', 'name email avatar')
        .populate('groupId', 'name');

      res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: { expense: updatedExpense },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update expense', 500);
    }
  },

  // Delete expense
  deleteExpense: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const expense = await Expense.findById(id);

      if (!expense) {
        throw new AppError('Expense not found', 404);
      }

      // Only the person who added can delete
      if (expense.addedBy.toString() !== userId) {
        throw new AppError('You can only delete your own expenses', 403);
      }

      await Expense.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete expense', 500);
    }
  },
};
