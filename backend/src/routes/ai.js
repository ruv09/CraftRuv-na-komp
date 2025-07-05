import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST /api/ai/suggest
// @desc    Get AI suggestions for furniture design
// @access  Private
router.post('/suggest', [
  body('roomType').isIn(['living', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining']).withMessage('Invalid room type'),
  body('style').isIn(['modern', 'classic', 'minimalist', 'rustic', 'industrial', 'scandinavian']).withMessage('Invalid style'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be positive'),
  body('dimensions').isObject().withMessage('Dimensions must be an object'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { roomType, style, budget, dimensions, requirements = [] } = req.body;

    // AI suggestion logic (simulated)
    const suggestions = generateAISuggestions(roomType, style, budget, dimensions, requirements);

    res.json({
      success: true,
      data: {
        suggestions,
        reasoning: `Based on your ${roomType} room with ${style} style and budget of ${budget}₽`
      }
    });

  } catch (error) {
    console.error('AI suggest error:', error);
    res.status(500).json({ 
      error: 'Server error while generating suggestions' 
    });
  }
});

// @route   POST /api/ai/optimize
// @desc    Optimize furniture design with AI
// @access  Private
router.post('/optimize', [
  body('project').isObject().withMessage('Project data is required'),
  body('optimizationType').isIn(['cost', 'space', 'ergonomics', 'aesthetics']).withMessage('Invalid optimization type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { project, optimizationType } = req.body;

    // AI optimization logic (simulated)
    const optimizedProject = optimizeProject(project, optimizationType);

    res.json({
      success: true,
      data: {
        optimizedProject,
        improvements: generateImprovements(project, optimizedProject, optimizationType)
      }
    });

  } catch (error) {
    console.error('AI optimize error:', error);
    res.status(500).json({ 
      error: 'Server error while optimizing project' 
    });
  }
});

// @route   POST /api/ai/validate
// @desc    Validate furniture design with AI
// @access  Private
router.post('/validate', [
  body('project').isObject().withMessage('Project data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { project } = req.body;

    // AI validation logic (simulated)
    const validation = validateProject(project);

    res.json({
      success: true,
      data: {
        validation
      }
    });

  } catch (error) {
    console.error('AI validate error:', error);
    res.status(500).json({ 
      error: 'Server error while validating project' 
    });
  }
});

// Helper function to generate AI suggestions
function generateAISuggestions(roomType, style, budget, dimensions, requirements) {
  const suggestions = {
    furniture: [],
    materials: [],
    layout: '',
    tips: []
  };

  // Furniture suggestions based on room type
  const roomFurniture = {
    living: ['sofa', 'coffee_table', 'tv_stand', 'bookshelf'],
    bedroom: ['bed', 'wardrobe', 'nightstand', 'dresser'],
    kitchen: ['kitchen_cabinet', 'dining_table', 'pantry'],
    bathroom: ['vanity', 'storage_cabinet', 'shelf'],
    office: ['desk', 'chair', 'bookshelf', 'filing_cabinet'],
    dining: ['dining_table', 'chairs', 'buffet', 'china_cabinet']
  };

  suggestions.furniture = roomFurniture[roomType] || [];

  // Material suggestions based on style and budget
  const styleMaterials = {
    modern: ['plywood', 'mdf', 'metal', 'glass'],
    classic: ['solid_wood', 'veneer', 'brass'],
    minimalist: ['plywood', 'mdf', 'metal'],
    rustic: ['solid_wood', 'reclaimed_wood'],
    industrial: ['metal', 'wood', 'concrete'],
    scandinavian: ['light_wood', 'plywood', 'white_paint']
  };

  suggestions.materials = styleMaterials[style] || [];

  // Layout suggestions
  suggestions.layout = generateLayoutSuggestion(roomType, dimensions);

  // Tips based on requirements
  suggestions.tips = generateTips(roomType, style, budget, requirements);

  return suggestions;
}

// Helper function to generate layout suggestions
function generateLayoutSuggestion(roomType, dimensions) {
  const layouts = {
    living: 'Place sofa against the longest wall, coffee table in center, TV stand opposite sofa',
    bedroom: 'Bed against the wall, wardrobe on opposite side, nightstands on both sides',
    kitchen: 'Work triangle: sink, stove, refrigerator in triangular arrangement',
    bathroom: 'Vanity near door, storage cabinet in corner, maximize floor space',
    office: 'Desk near window for natural light, chair with good ergonomics',
    dining: 'Dining table in center, chairs around, buffet against wall'
  };

  return layouts[roomType] || 'Optimize for traffic flow and functionality';
}

// Helper function to generate tips
function generateTips(roomType, style, budget, requirements) {
  const tips = [];

  // Budget-based tips
  if (budget < 50000) {
    tips.push('Consider using MDF or plywood instead of solid wood to reduce costs');
    tips.push('Opt for simple joinery methods like pocket holes');
  }

  // Style-based tips
  if (style === 'modern') {
    tips.push('Use clean lines and minimal ornamentation');
    tips.push('Consider hidden storage solutions');
  }

  // Room-specific tips
  if (roomType === 'kitchen') {
    tips.push('Ensure adequate counter space for food preparation');
    tips.push('Plan for proper ventilation and lighting');
  }

  return tips;
}

// Helper function to optimize project
function optimizeProject(project, optimizationType) {
  const optimized = { ...project };

  switch (optimizationType) {
    case 'cost':
      // Optimize for cost
      optimized.materials = optimized.materials.map(material => ({
        ...material,
        cost: material.cost * 0.8 // 20% cost reduction
      }));
      break;
    
    case 'space':
      // Optimize for space efficiency
      optimized.dimensions = {
        ...optimized.dimensions,
        width: optimized.dimensions.width * 0.9,
        depth: optimized.dimensions.depth * 0.9
      };
      break;
    
    case 'ergonomics':
      // Optimize for ergonomics
      if (optimized.dimensions.height < 750) {
        optimized.dimensions.height = 750;
      }
      break;
    
    case 'aesthetics':
      // Optimize for aesthetics
      optimized.settings = {
        ...optimized.settings,
        finish: 'varnish',
        joinery: 'dovetail'
      };
      break;
  }

  return optimized;
}

// Helper function to generate improvements
function generateImprovements(original, optimized, type) {
  const improvements = [];

  switch (type) {
    case 'cost':
      const costReduction = original.materials.reduce((sum, m) => sum + m.cost, 0) - 
                           optimized.materials.reduce((sum, m) => sum + m.cost, 0);
      improvements.push(`Cost reduced by ${costReduction.toFixed(2)}₽`);
      break;
    
    case 'space':
      const spaceReduction = (original.dimensions.width * original.dimensions.depth) - 
                            (optimized.dimensions.width * optimized.dimensions.depth);
      improvements.push(`Space usage reduced by ${spaceReduction.toFixed(2)}mm²`);
      break;
    
    case 'ergonomics':
      improvements.push('Improved ergonomics for better usability');
      break;
    
    case 'aesthetics':
      improvements.push('Enhanced visual appeal with premium finishes');
      break;
  }

  return improvements;
}

// Helper function to validate project
function validateProject(project) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Check dimensions
  if (project.dimensions.width < 300) {
    validation.errors.push('Width is too small for practical use');
    validation.isValid = false;
  }

  if (project.dimensions.height > 2500) {
    validation.warnings.push('Height may be too tall for standard rooms');
  }

  // Check materials
  const totalCost = project.materials.reduce((sum, m) => sum + m.cost, 0);
  if (totalCost > 100000) {
    validation.warnings.push('Total cost is quite high, consider alternatives');
  }

  // Check structural integrity
  if (project.dimensions.width > 2000 && project.materials.length < 3) {
    validation.errors.push('Large furniture needs adequate structural support');
    validation.isValid = false;
  }

  // Generate suggestions
  if (project.settings.joinery === 'butt' && project.dimensions.width > 1000) {
    validation.suggestions.push('Consider stronger joinery for large pieces');
  }

  return validation;
}

export default router; 