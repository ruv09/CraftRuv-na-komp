import express from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { tempUsers, tempProjects, tempFurniture } from '../utils/tempStorage.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Apply admin middleware to all routes
router.use(authMiddleware);
router.use(requireRole(['admin']));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = tempUsers.size;
    const totalProjects = tempProjects.size;
    const totalFurniture = tempFurniture.size;
    
    // Get recent users
    const recentUsers = Array.from(tempUsers.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Get recent projects
    const recentProjects = Array.from(tempProjects.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProjects,
          totalFurniture
        },
        recentUsers,
        recentProjects
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching dashboard data' 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let users = Array.from(tempUsers.values());

    // Apply search filter
    if (search) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = users.length;
    const paginatedUsers = users.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        users: paginatedUsers.map(user => ({ ...user, password: undefined })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching users' 
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user by admin
// @access  Private (Admin)
router.put('/users/:id', [
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
    const userId = req.params.id;

    // Find user
    let user = null;
    for (const [email, u] of tempUsers.entries()) {
      if (u._id === userId) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Update user
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (subscription) {
      user.subscription = {
        ...user.subscription,
        ...subscription
      };
    }

    // Save updated user
    tempUsers.set(user.email, user);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: { ...user, password: undefined }
      }
    });

  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ 
      error: 'Server error while updating user' 
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user by admin
// @access  Private (Admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Find and delete user
    let deleted = false;
    for (const [email, user] of tempUsers.entries()) {
      if (user._id === userId) {
        tempUsers.delete(email);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ 
      error: 'Server error while deleting user' 
    });
  }
});

// @route   GET /api/admin/textures
// @desc    Get all textures
// @access  Private (Admin)
router.get('/textures', async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    let textures = [];

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      textures = files
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => ({
          id: file,
          name: file,
          url: `/uploads/${file}`,
          size: fs.statSync(path.join(uploadsDir, file)).size,
          uploadedAt: fs.statSync(path.join(uploadsDir, file)).mtime
        }));
    }

    res.json({
      success: true,
      data: {
        textures
      }
    });

  } catch (error) {
    console.error('Get textures error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching textures' 
    });
  }
});

// @route   POST /api/admin/textures
// @desc    Upload new texture
// @access  Private (Admin)
router.post('/textures', upload.single('texture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }

    const texture = {
      id: req.file.filename,
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Texture uploaded successfully',
      data: {
        texture
      }
    });

  } catch (error) {
    console.error('Upload texture error:', error);
    res.status(500).json({ 
      error: 'Server error while uploading texture' 
    });
  }
});

// @route   DELETE /api/admin/textures/:id
// @desc    Delete texture
// @access  Private (Admin)
router.delete('/textures/:id', async (req, res) => {
  try {
    const textureId = req.params.id;
    const filePath = path.join(process.cwd(), 'uploads', textureId);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Texture deleted successfully'
      });
    } else {
      res.status(404).json({ 
        error: 'Texture not found' 
      });
    }

  } catch (error) {
    console.error('Delete texture error:', error);
    res.status(500).json({ 
      error: 'Server error while deleting texture' 
    });
  }
});

// @route   GET /api/admin/furniture
// @desc    Get all furniture items
// @access  Private (Admin)
router.get('/furniture', async (req, res) => {
  try {
    const furniture = Array.from(tempFurniture.values());

    res.json({
      success: true,
      data: {
        furniture
      }
    });

  } catch (error) {
    console.error('Get furniture error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching furniture' 
    });
  }
});

// @route   POST /api/admin/furniture
// @desc    Create new furniture item
// @access  Private (Admin)
router.post('/furniture', [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('dimensions').isObject().withMessage('Dimensions must be an object'),
  body('price').isNumeric().withMessage('Price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { name, category, dimensions, price, description, textures } = req.body;
    
    const furnitureId = Date.now().toString();
    const furniture = {
      _id: furnitureId,
      name,
      category,
      dimensions,
      price,
      description: description || '',
      textures: textures || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    tempFurniture.set(furnitureId, furniture);

    res.status(201).json({
      success: true,
      message: 'Furniture created successfully',
      data: {
        furniture
      }
    });

  } catch (error) {
    console.error('Create furniture error:', error);
    res.status(500).json({ 
      error: 'Server error while creating furniture' 
    });
  }
});

// @route   PUT /api/admin/furniture/:id
// @desc    Update furniture item
// @access  Private (Admin)
router.put('/furniture/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('dimensions').optional().isObject().withMessage('Dimensions must be an object'),
  body('price').optional().isNumeric().withMessage('Price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const furnitureId = req.params.id;
    const furniture = tempFurniture.get(furnitureId);

    if (!furniture) {
      return res.status(404).json({ 
        error: 'Furniture not found' 
      });
    }

    // Update furniture
    Object.assign(furniture, req.body, { updatedAt: new Date() });
    tempFurniture.set(furnitureId, furniture);

    res.json({
      success: true,
      message: 'Furniture updated successfully',
      data: {
        furniture
      }
    });

  } catch (error) {
    console.error('Update furniture error:', error);
    res.status(500).json({ 
      error: 'Server error while updating furniture' 
    });
  }
});

// @route   DELETE /api/admin/furniture/:id
// @desc    Delete furniture item
// @access  Private (Admin)
router.delete('/furniture/:id', async (req, res) => {
  try {
    const furnitureId = req.params.id;
    const deleted = tempFurniture.delete(furnitureId);

    if (!deleted) {
      return res.status(404).json({ 
        error: 'Furniture not found' 
      });
    }

    res.json({
      success: true,
      message: 'Furniture deleted successfully'
    });

  } catch (error) {
    console.error('Delete furniture error:', error);
    res.status(500).json({ 
      error: 'Server error while deleting furniture' 
    });
  }
});

// @route   GET /api/admin/projects
// @desc    Get all projects
// @access  Private (Admin)
router.get('/projects', async (req, res) => {
  try {
    const projects = Array.from(tempProjects.values());

    res.json({
      success: true,
      data: {
        projects
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching projects' 
    });
  }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Delete project by admin
// @access  Private (Admin)
router.delete('/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const deleted = tempProjects.delete(projectId);

    if (!deleted) {
      return res.status(404).json({ 
        error: 'Project not found' 
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      error: 'Server error while deleting project' 
    });
  }
});

export default router; 