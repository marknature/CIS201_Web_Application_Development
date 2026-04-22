import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().populate('userId', 'name email role');
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('userId', 'name email role');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
