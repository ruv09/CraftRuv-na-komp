import express from 'express';
import { body, validationResult, query } from 'express-validator';
// import Project from '../models/Project.js';
import { requireSubscription } from '../middleware/auth.js';
import { tempProjects } from '../utils/tempStorage.js';

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

    // Filter projects for current user (temporary)
    let userProjects = [];
    for (const [id, project] of tempProjects.entries()) {
      if (project.user === req.user._id) {
        if (type && project.type !== type) continue;
        if (status && project.status !== status) continue;
        if (search) {
          const searchLower = search.toLowerCase();
          if (!project.name.toLowerCase().includes(searchLower) && 
              !project.description.toLowerCase().includes(searchLower)) {
            continue;
          }
        }
        userProjects.push(project);
      }
    }

    // Sort by updatedAt (newest first)
    userProjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Pagination
    const total = userProjects.length;
    const paginatedProjects = userProjects.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        projects: paginatedProjects,
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

    const projectId = Date.now().toString();
    const projectData = {
      _id: projectId,
      ...req.body,
      user: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: req.body.status || 'draft',
      isPublic: false,
      views: 0,
      likes: [],
      materials: req.body.materials || [],
      settings: req.body.settings || {}
    };

    tempProjects.set(projectId, projectData);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: projectData
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
    const project = tempProjects.get(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found' 
      });
    }

    // Check if user owns the project or if it's public
    if (project.user !== req.user._id && !project.isPublic) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // Increment views for public projects
    if (project.isPublic && project.user !== req.user._id) {
      project.views += 1;
      tempProjects.set(req.params.id, project);
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

    const project = tempProjects.get(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found' 
      });
    }

    // Check ownership
    if (project.user !== req.user._id) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // Update project
    const updatedProject = {
      ...project,
      ...req.body,
      updatedAt: new Date()
    };

    tempProjects.set(req.params.id, updatedProject);

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
    const project = tempProjects.get(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found' 
      });
    }

    // Check ownership
    if (project.user !== req.user._id) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    tempProjects.delete(req.params.id);

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
    const project = tempProjects.get(req.params.id);

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

    tempProjects.set(req.params.id, project);

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

    // Filter public projects (temporary)
    let publicProjects = [];
    for (const [id, project] of tempProjects.entries()) {
      if (project.isPublic) {
        if (type && project.type !== type) continue;
        publicProjects.push(project);
      }
    }

    // Sort projects
    const sortOptions = {
      views: (a, b) => b.views - a.views,
      likes: (a, b) => b.likes.length - a.likes.length,
      recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    };

    publicProjects.sort(sortOptions[sort] || sortOptions.views);

    // Pagination
    const total = publicProjects.length;
    const paginatedProjects = publicProjects.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        projects: paginatedProjects,
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