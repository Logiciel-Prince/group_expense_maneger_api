import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ExpenseType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export enum SplitType {
  EQUAL = 'EQUAL',
}

export interface IExpense extends Document {
  groupId: Types.ObjectId;
  addedBy: Types.ObjectId;
  title: string;
  amount: number;
  type: ExpenseType;
  splitType: SplitType;
  date: Date;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(ExpenseType),
      required: true,
      default: ExpenseType.EXPENSE,
    },
    splitType: {
      type: String,
      enum: Object.values(SplitType),
      default: SplitType.EQUAL,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
expenseSchema.index({ groupId: 1, month: 1, year: 1 });
expenseSchema.index({ groupId: 1, date: -1 });
expenseSchema.index({ addedBy: 1 });
expenseSchema.index({ createdAt: -1 });

// Auto-populate month and year from date
expenseSchema.pre('save', function (next) {
  const date = new Date(this.date);
  this.month = date.getMonth() + 1; // 1-12
  this.year = date.getFullYear();
  next();
});

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
