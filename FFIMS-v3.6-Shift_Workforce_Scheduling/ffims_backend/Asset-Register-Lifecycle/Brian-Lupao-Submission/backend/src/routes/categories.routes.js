import express from 'express';
import { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory, getAssetsInCategory, searchCategories } from '../controllers/categories.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { permit } from '../middleware/rbac.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/search', searchCategories);
router.get('/', getCategories);
router.post('/', permit('admin'), createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', permit('admin'), updateCategory);
router.delete('/:id', permit('admin'), deleteCategory);
router.get('/:id/assets', getAssetsInCategory);

export default router;
