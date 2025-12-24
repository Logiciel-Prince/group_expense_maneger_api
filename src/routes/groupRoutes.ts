import { Router } from 'express';
import { groupController } from '../controllers/groupController';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Group CRUD
router.post('/', validate(schemas.createGroup), groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/:id', groupController.getGroupById);
router.put('/:id', validate(schemas.updateGroup), groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// Member management
router.post('/:id/members', validate(schemas.addMember), groupController.addMember);
router.delete('/:id/members/:userId', groupController.removeMember);

export default router;
