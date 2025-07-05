import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Furniture templates and components
const furnitureTemplates = {
  cabinet: {
    name: 'Шкаф',
    description: 'Универсальный шкаф с настраиваемыми полками',
    defaultDimensions: { width: 800, height: 2000, depth: 600 },
    components: [
      { name: 'Задняя стенка', type: 'panel', required: true },
      { name: 'Боковые стенки', type: 'panel', required: true, quantity: 2 },
      { name: 'Верхняя панель', type: 'panel', required: true },
      { name: 'Нижняя панель', type: 'panel', required: true },
      { name: 'Полки', type: 'shelf', required: false, quantity: 3 },
      { name: 'Двери', type: 'door', required: false, quantity: 2 }
    ]
  },
  kitchen: {
    name: 'Кухня',
    description: 'Кухонный гарнитур с рабочей поверхностью',
    defaultDimensions: { width: 3000, height: 850, depth: 600 },
    components: [
      { name: 'Навесные шкафы', type: 'cabinet', required: true },
      { name: 'Напольные шкафы', type: 'cabinet', required: true },
      { name: 'Рабочая поверхность', type: 'panel', required: true },
      { name: 'Фартук', type: 'panel', required: false }
    ]
  },
  table: {
    name: 'Стол',
    description: 'Стол с ножками и столешницей',
    defaultDimensions: { width: 1200, height: 750, depth: 800 },
    components: [
      { name: 'Столешница', type: 'panel', required: true },
      { name: 'Ножки', type: 'leg', required: true, quantity: 4 }
    ]
  },
  chair: {
    name: 'Стул',
    description: 'Стул с сиденьем и спинкой',
    defaultDimensions: { width: 450, height: 850, depth: 550 },
    components: [
      { name: 'Сиденье', type: 'panel', required: true },
      { name: 'Спинка', type: 'panel', required: true },
      { name: 'Ножки', type: 'leg', required: true, quantity: 4 }
    ]
  },
  bed: {
    name: 'Кровать',
    description: 'Кровать с изголовьем и основанием',
    defaultDimensions: { width: 1600, height: 2000, depth: 600 },
    components: [
      { name: 'Основание', type: 'panel', required: true },
      { name: 'Изголовье', type: 'panel', required: false },
      { name: 'Боковые панели', type: 'panel', required: false, quantity: 2 }
    ]
  },
  shelf: {
    name: 'Полка',
    description: 'Настенная полка для книг и декора',
    defaultDimensions: { width: 800, height: 200, depth: 300 },
    components: [
      { name: 'Полка', type: 'shelf', required: true },
      { name: 'Кронштейны', type: 'bracket', required: true, quantity: 2 }
    ]
  }
};

// @route   GET /api/furniture/templates
// @desc    Get available furniture templates
// @access  Private
router.get('/templates', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        templates: furnitureTemplates
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching templates' 
    });
  }
});

// @route   GET /api/furniture/templates/:type
// @desc    Get specific furniture template
// @access  Private
router.get('/templates/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const template = furnitureTemplates[type];

    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found' 
      });
    }

    res.json({
      success: true,
      data: {
        template
      }
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching template' 
    });
  }
});

// @route   POST /api/furniture/calculate
// @desc    Calculate materials and cost for furniture
// @access  Private
router.post('/calculate', [
  body('type').isIn(Object.keys(furnitureTemplates)).withMessage('Invalid furniture type'),
  body('dimensions').isObject().withMessage('Dimensions must be an object'),
  body('dimensions.width').isFloat({ min: 0 }).withMessage('Width must be positive'),
  body('dimensions.height').isFloat({ min: 0 }).withMessage('Height must be positive'),
  body('dimensions.depth').isFloat({ min: 0 }).withMessage('Depth must be positive'),
  body('materials').isArray().withMessage('Materials must be an array'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { type, dimensions, materials, settings = {} } = req.body;
    const template = furnitureTemplates[type];

    if (!template) {
      return res.status(400).json({ 
        error: 'Invalid furniture type' 
      });
    }

    // Calculate materials based on dimensions and template
    const calculatedMaterials = calculateMaterials(template, dimensions, materials, settings);
    
    // Calculate total cost
    const totalCost = calculatedMaterials.reduce((sum, material) => {
      return sum + (material.cost || 0);
    }, 0);

    // Estimate construction time
    const estimatedTime = estimateConstructionTime(template, settings);

    res.json({
      success: true,
      data: {
        materials: calculatedMaterials,
        totalCost,
        estimatedTime,
        template: template
      }
    });

  } catch (error) {
    console.error('Calculate furniture error:', error);
    res.status(500).json({ 
      error: 'Server error while calculating furniture' 
    });
  }
});

// Helper function to calculate materials
function calculateMaterials(template, dimensions, selectedMaterials, settings) {
  const materials = [];
  
  template.components.forEach(component => {
    const quantity = component.quantity || 1;
    const material = selectedMaterials.find(m => m.name === component.name) || {
      type: 'wood',
      thickness: 18,
      cost: 0
    };

    // Calculate area/volume based on component type and dimensions
    let area = 0;
    switch (component.type) {
      case 'panel':
        area = calculatePanelArea(component, dimensions);
        break;
      case 'shelf':
        area = calculateShelfArea(component, dimensions);
        break;
      case 'door':
        area = calculateDoorArea(component, dimensions);
        break;
      default:
        area = 0;
    }

    const totalArea = area * quantity;
    const cost = (material.cost || 0) * totalArea;

    materials.push({
      name: component.name,
      type: material.type,
      thickness: material.thickness,
      area: totalArea,
      quantity,
      cost,
      unit: 'm2'
    });
  });

  return materials;
}

// Helper function to calculate panel area
function calculatePanelArea(component, dimensions) {
  const { width, height, depth } = dimensions;
  
  switch (component.name) {
    case 'Задняя стенка':
      return (width * height) / 1000000; // Convert to m2
    case 'Боковые стенки':
      return (depth * height) / 1000000;
    case 'Верхняя панель':
    case 'Нижняя панель':
      return (width * depth) / 1000000;
    default:
      return 0;
  }
}

// Helper function to calculate shelf area
function calculateShelfArea(component, dimensions) {
  const { width, depth } = dimensions;
  return (width * depth) / 1000000;
}

// Helper function to calculate door area
function calculateDoorArea(component, dimensions) {
  const { height, depth } = dimensions;
  return (depth * height) / 1000000;
}

// Helper function to estimate construction time
function estimateConstructionTime(template, settings) {
  let baseTime = template.components.length * 0.5; // 30 minutes per component
  
  // Adjust based on joinery type
  switch (settings.joinery) {
    case 'dovetail':
      baseTime *= 2;
      break;
    case 'dado':
      baseTime *= 1.5;
      break;
    case 'pocket':
      baseTime *= 1.2;
      break;
    default:
      baseTime *= 1;
  }

  // Adjust based on finish
  if (settings.finish && settings.finish !== 'none') {
    baseTime += 2; // Add 2 hours for finishing
  }

  return Math.round(baseTime * 10) / 10; // Round to 1 decimal place
}

export default router; 