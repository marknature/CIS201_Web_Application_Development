import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { permit } from '../middleware/rbac.js';
import { getUsers, getRoles, updateUser, deleteUser, searchUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/search', searchUsers);
router.get('/', permit('admin'), getUsers);
router.get('/roles', permit('admin'), getRoles);
router.put('/:userId', permit('admin'), updateUser);
router.delete('/:userId', permit('admin'), deleteUser);

export default router;
