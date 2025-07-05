import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching profile' 
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('preferences.theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  body('preferences.language').optional().isIn(['ru', 'en']).withMessage('Invalid language'),
  body('preferences.units').optional().isIn(['metric', 'imperial']).withMessage('Invalid units')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { name, preferences, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (preferences) {
      updateData.preferences = {
        ...req.user.preferences,
        ...preferences
      };
    }
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Server error while updating profile' 
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Server error while changing password' 
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    // Import Project model here to avoid circular dependency
    const { default: Project } = await import('../models/Project.js');
    
    const stats = await Project.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          completedProjects: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
          averageCost: { $avg: '$metadata.totalCost' }
        }
      }
    ]);

    const result = stats[0] || {
      totalProjects: 0,
      completedProjects: 0,
      totalViews: 0,
      totalLikes: 0,
      averageCost: 0
    };

    res.json({
      success: true,
      data: {
        stats: result
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching statistics' 
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', [
  body('password').notEmpty().withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        error: 'Password is incorrect' 
      });
    }

    // Import Project model here to avoid circular dependency
    const { default: Project } = await import('../models/Project.js');
    
    // Delete user's projects
    await Project.deleteMany({ user: req.user._id });
    
    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: 'Server error while deleting account' 
    });
  }
});

// Admin routes
// @route   GET /api/users/admin/all
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/admin/all', requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching users' 
    });
  }
});

// @route   PUT /api/users/admin/:id
// @desc    Update user by admin
// @access  Private (Admin)
router.put('/admin/:id', requireRole(['admin']), [
  body('role').optional().isIn(['user', 'premium', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('subscription.plan').optional().isIn(['free', 'basic', 'pro']).withMessage('Invalid subscription plan')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { role, isActive, subscription } = req.body;
    const updateData = {};

    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (subscription) updateData.subscription = subscription;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ 
      error: 'Server error while updating user' 
    });
  }
});

export default router; 