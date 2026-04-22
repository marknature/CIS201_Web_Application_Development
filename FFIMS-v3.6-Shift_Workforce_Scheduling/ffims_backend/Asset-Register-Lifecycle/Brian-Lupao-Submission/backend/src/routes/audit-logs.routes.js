import express from 'express';
import { getAuditLogs, getAuditLogById } from '../controllers/auditLogController.js';
const router = express.Router();

router.get('/', getAuditLogs);
router.get('/:id', getAuditLogById);

export default router;
