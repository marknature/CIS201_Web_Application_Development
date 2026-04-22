import express from 'express';
import { chatSend, chatStream } from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send', authMiddleware, chatSend);
router.post('/stream', authMiddleware, chatStream);

export default router;
