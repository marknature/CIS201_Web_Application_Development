// ffims_backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getCurrentUser, updateUserRole } = require('../services/auth.service');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

// ========== PUBLIC ROUTES ==========

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, firstName, surname, email, password, role, phone } = req.body;
    
    const result = await registerUser(
      { username, firstName, surname, email, password, role, phone },
      req.ip,
      req.headers['user-agent']
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await loginUser(
      email, 
      password, 
      req.ip, 
      req.headers['user-agent']
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    const result = await logoutUser(token);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== PROTECTED ROUTES ==========

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', 
  authenticateToken, 
  authorize('system_administrator'), 
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      const updatedUser = await updateUserRole(req.user.id, userId, role);
      
      res.json({
        success: true,
        message: 'User role updated',
        user: updatedUser
      });
    } catch (error) {
      res.status(403).json({ 
        success: false, 
        error: error.message 
      });
    }
});

// Example: Get all users (admin only)
router.get('/users', 
  authenticateToken, 
  authorize('system_administrator'), 
  async (req, res) => {
    try {
      const User = require('../models/user.model');
      const users = await User.find({}).select('-passwordHash');
      
      res.json({
        success: true,
        users
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
});

module.exports = router;
