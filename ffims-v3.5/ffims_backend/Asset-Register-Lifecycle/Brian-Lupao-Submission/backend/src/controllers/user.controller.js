import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

export const getAllUsers = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find().select('-password').skip(skip).limit(limit).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'admin' && req.user?._id?.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role } = req.body;

    if (req.user?.role !== 'admin' && req.user?._id?.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const changes = {};
    if (firstName && firstName !== user.firstName) changes.firstName = { old: user.firstName, new: firstName };
    if (lastName && lastName !== user.lastName) changes.lastName = { old: user.lastName, new: lastName };
    if (email && email !== user.email) changes.email = { old: user.email, new: email };
    if (role && role !== user.role) {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can change roles.' });
      }
      changes.role = { old: user.role, new: role };
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ success: false, message: 'No changes to update.' });
    }

    Object.assign(user, req.body);
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id,
      changes,
      ipAddress: req.ip,
    });

    const updatedUser = await User.findById(id).select('-password');
    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { hardDelete } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (hardDelete === 'true') {
      await User.findByIdAndDelete(id);
      await AuditLog.create({
        userId: req.user._id,
        action: 'HARD_DELETE',
        entityType: 'User',
        entityId: user._id,
        changes: { deletedUser: user.email },
        ipAddress: req.ip,
      });
      return res.status(200).json({ success: true, message: 'User permanently deleted.' });
    }

    user.isActive = false;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'SOFT_DELETE',
      entityType: 'User',
      entityId: user._id,
      changes: { isActive: { old: true, new: false } },
      ipAddress: req.ip,
    });

    return res.status(200).json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const validRoles = ['admin', 'asset-manager', 'technician', 'user'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role };
    if (req.user?.role !== 'admin') {
      query.isActive = true;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const roleCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, { admin: 0, 'asset-manager': 0, technician: 0, user: 0 });

    return res.status(200).json({
      success: true,
      data: {
        roleCounts,
        totalUsers,
        activeUsers,
        inactiveUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    if (!q) {
      const users = await User.find().select('-password').limit(limit).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: users });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { username: regex },
      ]
    }).select('-password').limit(limit);

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUsers = getAllUsers;

export const getRoles = async (req, res) => {
  const roles = ['admin', 'asset-manager', 'technician', 'user'];
  return res.status(200).json({ success: true, data: roles });
};

export const assignRole = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;
    const { role } = req.body;
    const validRoles = ['admin', 'asset-manager', 'technician', 'user'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const changes = { role: { old: user.role, new: role } };
    user.role = role;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id,
      changes,
      ipAddress: req.ip,
    });

    return res.status(200).json({ success: true, data: { userId, role } });
  } catch (error) {
    next(error);
  }
};