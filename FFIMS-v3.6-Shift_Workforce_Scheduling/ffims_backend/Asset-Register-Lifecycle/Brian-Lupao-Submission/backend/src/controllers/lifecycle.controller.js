import AssetTransaction from '../models/AssetTransaction.js';
import Asset from '../models/Asset.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import AuditLog from '../models/AuditLog.js';

const VALID_TRANSACTION_TYPES = ['deployment', 'allocation', 'transfer', 'maintenance', 'retirement', 'disposal', 'acquisition'];

const createAuditLog = async (userId, action, entityType, entityId, changes, ipAddress) => {
  try {
    await AuditLog.create({ userId, action, entityType, entityId, changes, ipAddress });
  } catch (error) {
    console.error('Audit log creation failed:', error.message);
  }
};

export const getLifecycle = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    if (!assetId) {
      return res.status(400).json({ success: false, message: 'Asset ID is required' });
    }
    const transactions = await AssetTransaction.find({ assetId })
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email')
      .populate('documentId', 'name type')
      .sort({ timestamp: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

export const createLifecycle = async (req, res, next) => {
  try {
    const { assetId, transactionType, fromLocation, toLocation, notes, documentId } = req.body;
    if (!assetId || !transactionType) {
      return res.status(400).json({ success: false, message: 'Asset ID and transaction type are required' });
    }
    if (!VALID_TRANSACTION_TYPES.includes(transactionType)) {
      return res.status(400).json({ success: false, message: `Invalid transaction type. Must be one of: ${VALID_TRANSACTION_TYPES.join(', ')}` });
    }
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    const transaction = await AssetTransaction.create({
      assetId,
      transactionType,
      fromLocation: fromLocation || asset.location,
      toLocation,
      timestamp: new Date(),
      performedBy: req.user?.id,
      notes,
      documentId
    });
    const populatedTransaction = await AssetTransaction.findById(transaction._id)
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email');
    await createAuditLog(req.user?.id, 'CREATE', 'AssetTransaction', transaction._id, req.body, req.ip);
    res.status(201).json({ success: true, data: populatedTransaction });
  } catch (error) {
    next(error);
  }
};

export const updateLifecycle = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const updateData = req.body;
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }
    const existingTransaction = await AssetTransaction.findById(transactionId);
    if (!existingTransaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (updateData.transactionType && !VALID_TRANSACTION_TYPES.includes(updateData.transactionType)) {
      return res.status(400).json({ success: false, message: `Invalid transaction type` });
    }
    const transaction = await AssetTransaction.findByIdAndUpdate(transactionId, updateData, { new: true })
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email');
    await createAuditLog(req.user?.id, 'UPDATE', 'AssetTransaction', transactionId, updateData, req.ip);
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const deleteLifecycle = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }
    const transaction = await AssetTransaction.findByIdAndDelete(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    await createAuditLog(req.user?.id, 'DELETE', 'AssetTransaction', transactionId, null, req.ip);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAssetHistory = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    if (!assetId) {
      return res.status(400).json({ success: false, message: 'Asset ID is required' });
    }
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    const [transactions, maintenanceLogs] = await Promise.all([
      AssetTransaction.find({ assetId })
        .populate('fromLocation', 'name code')
        .populate('toLocation', 'name code')
        .populate('performedBy', 'name email')
        .populate('documentId', 'name type')
        .sort({ timestamp: 1 }),
      MaintenanceLog.find({ assetId })
        .populate('performedBy', 'name email')
        .sort({ maintenanceDate: 1 })
    ]);
    const timeline = [
      ...transactions.map(t => ({
        type: 'transaction',
        id: t._id,
        transactionType: t.transactionType,
        from: t.fromLocation,
        to: t.toLocation,
        timestamp: t.timestamp,
        performedBy: t.performedBy,
        notes: t.notes
      })),
      ...maintenanceLogs.map(m => ({
        type: 'maintenance',
        id: m._id,
        maintenanceType: m.type,
        description: m.description,
        date: m.maintenanceDate,
        performedBy: m.performedBy,
        cost: m.cost
      }))
    ].sort((a, b) => new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date));
    res.json({ success: true, data: { asset, timeline } });
  } catch (error) {
    next(error);
  }
};

export const predictLifecycleActions = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    if (!assetId) {
      return res.status(400).json({ success: false, message: 'Asset ID is required' });
    }

    const transactions = await AssetTransaction.find({ assetId }).sort({ timestamp: -1 });
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const lastTransaction = transactions[0];
    const actions = [];
    if (!lastTransaction) {
      actions.push('allocate', 'transfer', 'maintenance');
    } else {
      const type = lastTransaction.transactionType;
      if (['deployment', 'allocation', 'transfer'].includes(type)) {
        actions.push('maintenance', 'transfer', 'dispose');
      } else if (['maintenance'].includes(type)) {
        const daysSince = (Date.now() - new Date(lastTransaction.timestamp).getTime()) / (1000 * 3600 * 24);
        if (daysSince > 30) actions.push('maintenance');
        actions.push('transfer', 'dispose');
      } else if (['retirement', 'disposal'].includes(type)) {
        actions.push('archive');
      } else {
        actions.push('maintenance', 'transfer', 'dispose');
      }
    }

    res.status(200).json({ success: true, data: { assetId, suggestions: Array.from(new Set(actions)) } });
  } catch (error) {
    next(error);
  }
};

export const allocateAsset = async (req, res, next) => {
  try {
    const { assetId, toUser, toDepartment, notes } = req.body;
    if (!assetId) {
      return res.status(400).json({ success: false, message: 'Asset ID is required' });
    }
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    const transaction = await AssetTransaction.create({
      assetId,
      transactionType: 'deployment',
      fromLocation: asset.location,
      toLocation: toDepartment,
      performedBy: req.user?.id,
      notes: notes || `Allocated to user ${toUser || 'unknown'}`,
      timestamp: new Date()
    });
    asset.status = 'active';
    await asset.save();
    const populatedTransaction = await AssetTransaction.findById(transaction._id)
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email');
    await createAuditLog(req.user?.id, 'ALLOCATE', 'Asset', assetId, { toUser, toDepartment }, req.ip);
    res.status(201).json({ success: true, data: populatedTransaction });
  } catch (error) {
    next(error);
  }
};

export const transferAsset = async (req, res, next) => {
  try {
    const { assetId, toLocation, toUser, notes } = req.body;
    if (!assetId || !toLocation) {
      return res.status(400).json({ success: false, message: 'Asset ID and destination location are required' });
    }
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    const transaction = await AssetTransaction.create({
      assetId,
      transactionType: 'transfer',
      fromLocation: asset.location,
      toLocation,
      performedBy: req.user?.id,
      notes: notes || `Transferred from ${asset.location} to ${toLocation}`,
      timestamp: new Date()
    });
    asset.location = toLocation;
    if (toUser) asset.custodian = toUser;
    await asset.save();
    const populatedTransaction = await AssetTransaction.findById(transaction._id)
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email');
    await createAuditLog(req.user?.id, 'TRANSFER', 'Asset', assetId, { from: asset.location, to: toLocation }, req.ip);
    res.status(201).json({ success: true, data: populatedTransaction });
  } catch (error) {
    next(error);
  }
};

export const disposeAsset = async (req, res, next) => {
  try {
    const { assetId, disposalReason, disposalMethod, notes } = req.body;
    if (!assetId) {
      return res.status(400).json({ success: false, message: 'Asset ID is required' });
    }
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    if (asset.status === 'retired') {
      return res.status(400).json({ success: false, message: 'Asset is already disposed' });
    }
    const transaction = await AssetTransaction.create({
      assetId,
      transactionType: 'retirement',
      fromLocation: asset.location,
      performedBy: req.user?.id,
      notes: notes || `Disposed: ${disposalReason || 'No reason provided'}`,
      timestamp: new Date()
    });
    asset.status = 'retired';
    await asset.save();
    const populatedTransaction = await AssetTransaction.findById(transaction._id)
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email');
    await createAuditLog(req.user?.id, 'DISPOSE', 'Asset', assetId, { disposalReason, disposalMethod }, req.ip);
    res.status(201).json({ success: true, data: populatedTransaction });
  } catch (error) {
    next(error);
  }
};

export const getRecentTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const transactionType = req.query.type;
    const query = transactionType ? { transactionType } : {};
    const [transactions, total] = await Promise.all([
      AssetTransaction.find(query)
        .populate('assetId', 'name assetId')
        .populate('fromLocation', 'name code')
        .populate('toLocation', 'name code')
        .populate('performedBy', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AssetTransaction.countDocuments(query)
    ]);
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getLifecycle,
  createLifecycle,
  updateLifecycle,
  deleteLifecycle,
  getAssetHistory,
  allocateAsset,
  transferAsset,
  disposeAsset,
  getRecentTransactions
};