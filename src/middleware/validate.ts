import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  createGroup: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
  }),

  addMember: Joi.object({
    email: Joi.string().email().required(),
  }),

  createExpense: Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    amount: Joi.number().positive().required(),
    type: Joi.string().valid('EXPENSE', 'INCOME').required(),
    date: Joi.date().iso().optional(),
  }),

  updateExpense: Joi.object({
    title: Joi.string().trim().min(1).max(200).optional(),
    amount: Joi.number().positive().optional(),
    type: Joi.string().valid('EXPENSE', 'INCOME').optional(),
    date: Joi.date().iso().optional(),
  }),

  updateGroup: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
  }),
};
