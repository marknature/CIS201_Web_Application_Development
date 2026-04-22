import express from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/dashboard', authMiddleware, getDashboardAnalytics);

export default router;
