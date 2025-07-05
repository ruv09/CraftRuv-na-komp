import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Project from '../models/Project.js';
import { requireSubscription } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/projects
// @desc    Get user's projects
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['cabinet', 'kitchen', 'table', 'chair', 'bed', 'shelf', 'custom']).withMessage('Invalid project type'),
  query('status').optional().isIn(['draft', 'in_progress', 'completed', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { page = 1, limit = 10, type, status, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching projects' 
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('type').isIn(['cabinet', 'kitchen', 'table', 'chair', 'bed', 'shelf', 'custom']).withMessage('Invalid project type'),
  body('dimensions.width').isFloat({ min: 0 }).withMessage('Width must be a positive number'),
  body('dimensions.height').isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('dimensions.depth').isFloat({ min: 0 }).withMessage('Depth must be a positive number'),
  body('dimensions.unit').optional().isIn(['mm', 'cm', 'm']).withMessage('Invalid unit')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const projectData = {
      ...req.body,
      user: req.user._id
    };

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project
      }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      error: 'Server error while creating project' 
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('user', 'name email');

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found' 
      });
    }

    // Check if user owns the project or if it's public
    if (project.user._id.toString() !== req.user._id.toString() && !project.isPublic) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // Increment views for public projects
    if (project.isPublic && project.user._id.toString() !== req.user._id.toString()) {
      project.views += 1;
      await project.save();
    }

    res.json({
      success: true,
      data: {
        project
      }
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching project' 
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be less than 100 characters'),
  body('type').optional().isIn(['cabinet', 'kitchen', 'table', 'chair', 'bed', 'shelf', 'custom']).withMessage('Invalid project type'),
  body('status').optional().isIn(['draft', 'in_progress', 'completed', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found' 
      });
    }

    // Check ownership
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject
      }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      error: 'Server error while updating project' 
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found' 
      });
    }

    // Check ownership
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    await Project.findByIdAndDelete(req.params.id);

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

// @route   POST /api/projects/:id/like
// @desc    Like/unlike a public project
// @access  Private
router.post('/:id/like', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found' 
      });
    }

    if (!project.isPublic) {
      return res.status(403).json({ 
        error: 'Cannot like private projects' 
      });
    }

    const likeIndex = project.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Unlike
      project.likes.splice(likeIndex, 1);
    } else {
      // Like
      project.likes.push(req.user._id);
    }

    await project.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? 'Project unliked' : 'Project liked',
      data: {
        liked: likeIndex === -1,
        likeCount: project.likes.length
      }
    });

  } catch (error) {
    console.error('Like project error:', error);
    res.status(500).json({ 
      error: 'Server error while liking project' 
    });
  }
});

// @route   GET /api/projects/public/explore
// @desc    Get public projects for exploration
// @access  Private
router.get('/public/explore', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('type').optional().isIn(['cabinet', 'kitchen', 'table', 'chair', 'bed', 'shelf', 'custom']).withMessage('Invalid project type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { page = 1, limit = 12, type, sort = 'views' } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isPublic: true };
    if (type) filter.type = type;

    const sortOptions = {
      views: { views: -1 },
      likes: { likeCount: -1 },
      recent: { createdAt: -1 }
    };

    const projects = await Project.find(filter)
      .sort(sortOptions[sort] || sortOptions.views)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name');

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Explore projects error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching public projects' 
    });
  }
});

export default router; 