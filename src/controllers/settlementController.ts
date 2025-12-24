import { Response } from 'express';
import { Expense, ExpenseType } from '../models/Expense';
import { Group } from '../models/Group';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface UserBalance {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  paid: number;
  share: number;
  balance: number;
}

interface Settlement {
  from: {
    userId: string;
    name: string;
    avatar: string;
  };
  to: {
    userId: string;
    name: string;
    avatar: string;
  };
  amount: number;
}

export const settlementController = {
  // Calculate settlements for a group
  calculateSettlements: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { month, year } = req.query;
      const userId = req.user!.id;

      // Verify user is a member
      const group = await Group.findById(groupId).populate('members', 'name email avatar');

      if (!group) {
        throw new AppError('Group not found', 404);
      }

      const isMember = group.members.some(
        (member: any) => member._id.toString() === userId
      );

      if (!isMember) {
        throw new AppError('Access denied', 403);
      }

      // Build query
      const query: any = { groupId };
      if (month && year) {
        query.month = parseInt(month as string);
        query.year = parseInt(year as string);
      }

      // Get all expenses
      const expenses = await Expense.find(query).populate('addedBy', 'name email avatar');

      // Calculate balances for each member
      const memberCount = group.members.length;
      const balances: Map<string, UserBalance> = new Map();

      // Initialize balances
      group.members.forEach((member: any) => {
        balances.set(member._id.toString(), {
          userId: member._id.toString(),
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          paid: 0,
          share: 0,
          balance: 0,
        });
      });

      // Calculate paid amounts and shares
      expenses.forEach((expense) => {
        const paidBy = expense.addedBy._id.toString();
        const sharePerPerson = expense.amount / memberCount;

        if (expense.type === ExpenseType.EXPENSE) {
          // For expenses: person who paid gets credit
          const payer = balances.get(paidBy);
          if (payer) {
            payer.paid += expense.amount;
          }

          // Everyone shares the cost
          group.members.forEach((member: any) => {
            const memberId = member._id.toString();
            const memberBalance = balances.get(memberId);
            if (memberBalance) {
              memberBalance.share += sharePerPerson;
            }
          });
        } else if (expense.type === ExpenseType.INCOME) {
          // For income: reduce everyone's share
          group.members.forEach((member: any) => {
            const memberId = member._id.toString();
            const memberBalance = balances.get(memberId);
            if (memberBalance) {
              memberBalance.share -= sharePerPerson;
            }
          });
        }
      });

      // Calculate net balance (positive = owed to them, negative = they owe)
      balances.forEach((balance) => {
        balance.balance = balance.paid - balance.share;
      });

      // Calculate settlements (who owes whom)
      const settlements = calculateOptimalSettlements(Array.from(balances.values()));

      // Prepare user balances array
      const userBalances = Array.from(balances.values()).map((b) => ({
        userId: b.userId,
        name: b.name,
        email: b.email,
        avatar: b.avatar,
        paid: Math.round(b.paid * 100) / 100,
        share: Math.round(b.share * 100) / 100,
        balance: Math.round(b.balance * 100) / 100,
      }));

      res.status(200).json({
        success: true,
        data: {
          userBalances,
          settlements,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Settlement calculation error:', error);
      throw new AppError('Failed to calculate settlements', 500);
    }
  },
};

// Helper function to calculate optimal settlements
function calculateOptimalSettlements(balances: UserBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
    .sort((a, b) => b.balance - a.balance);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.balance, debtor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: {
          userId: debtor.userId,
          name: debtor.name,
          avatar: debtor.avatar,
        },
        to: {
          userId: creditor.userId,
          name: creditor.name,
          avatar: creditor.avatar,
        },
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.balance -= amount;
    debtor.balance -= amount;

    if (creditor.balance < 0.01) i++;
    if (debtor.balance < 0.01) j++;
  }

  return settlements;
}
