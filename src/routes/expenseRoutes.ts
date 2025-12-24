import { Router } from 'express';
import { expenseController } from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Expense CRUD
router.post('/', validate(schemas.createExpense), expenseController.createExpense);
router.get('/group/:groupId', expenseController.getGroupExpenses);
router.get('/group/:groupId/monthly', expenseController.getMonthlyExpenses);
router.put('/:id', validate(schemas.updateExpense), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

export default router;
