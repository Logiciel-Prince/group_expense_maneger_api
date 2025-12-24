import { Router } from 'express';
import { settlementController } from '../controllers/settlementController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Settlement calculations
router.get('/group/:groupId', settlementController.calculateSettlements);

export default router;
