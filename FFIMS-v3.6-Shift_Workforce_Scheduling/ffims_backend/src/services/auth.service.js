// ffims_backend/src/services/auth.service.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const UserSession = require('../models/user-session.model');
const AuditLog = require('../models/audit-log.model');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      surname: user.surname,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// Register new user
const registerUser = async (userData, ipAddress = null, userAgent = null) => {
  const { username, email, firstName, surname, password, role, phone } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (existingUser) {
    throw new Error(existingUser.email === email ? 'Email already registered' : 'Username already taken');
  }

  // Create new user
  const user = new User({
    username: username || email.split('@')[0],
    email,
    firstName,
    surname,
    passwordHash: password, // Will be hashed by pre-save middleware
    role: role || 'user',
    phone: phone || null,
    isActive: true
  });

  await user.save();

  // Generate token
  const token = generateToken(user);
  
  // Create session
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1); // 1 day expiry
  
  const session = new UserSession({
    userId: user._id,
    sessionToken: token,
    loginTime: new Date(),
    expiryTime: expiryDate,
    isRevoked: false
  });
  await session.save();

  // Log registration
  const auditLog = new AuditLog({
    userId: user._id,
    moduleName: 'AUTH',
    actionType: 'REGISTER',
    entityName: 'User',
    entityId: user._id,
    oldValues: null,
    newValues: { email: user.email, role: user.role },
    ipAddress,
    userAgent,
    createdAt: new Date()
  });
  await auditLog.save();

  return {
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      surname: user.surname,
      role: user.role
    },
    token
  };
};

// Login user
const loginUser = async (email, password, ipAddress = null, userAgent = null) => {
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated. Please contact administrator');
  }

  // Verify password
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    // Log failed attempt
    const auditLog = new AuditLog({
      userId: user._id,
      moduleName: 'AUTH',
      actionType: 'LOGIN_FAILED',
      entityName: 'User',
      entityId: user._id,
      oldValues: null,
      newValues: { reason: 'Invalid password' },
      ipAddress,
      userAgent,
      createdAt: new Date()
    });
    await auditLog.save();
    
    throw new Error('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate new token
  const token = generateToken(user);
  
  // Create new session
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1);
  
  const session = new UserSession({
    userId: user._id,
    sessionToken: token,
    loginTime: new Date(),
    expiryTime: expiryDate,
    isRevoked: false
  });
  await session.save();

  // Log successful login
  const auditLog = new AuditLog({
    userId: user._id,
    moduleName: 'AUTH',
    actionType: 'LOGIN_SUCCESS',
    entityName: 'User',
    entityId: user._id,
    oldValues: null,
    newValues: { email: user.email },
    ipAddress,
    userAgent,
    createdAt: new Date()
  });
  await auditLog.save();

  return {
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      surname: user.surname,
      role: user.role
    },
    token
  };
};

// Logout user
const logoutUser = async (token) => {
  // Invalidate session
  await UserSession.findOneAndUpdate(
    { sessionToken: token, isRevoked: false },
    { isRevoked: true }
  );
  
  return { success: true, message: 'Logged out successfully' };
};

// Verify token and get user
const verifyToken = async (token) => {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is valid
    const session = await UserSession.findOne({
      sessionToken: token,
      isRevoked: false,
      expiryTime: { $gt: new Date() }
    });
    
    if (!session) {
      throw new Error('Invalid or expired session');
    }
    
    // Get user
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    return {
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        surname: user.surname,
        role: user.role
      }
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Get current user
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Update user role (admin only)
const updateUserRole = async (adminId, userId, newRole) => {
  // Check if admin has permission
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'system_administrator') {
    throw new Error('Unauthorized: Only System Administrators can change roles');
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole, updatedAt: new Date() },
    { new: true }
  ).select('-passwordHash');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  getCurrentUser,
  updateUserRole,
  generateToken
};