import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const router = express.Router();

// Mock AI responses
const mockAIResponses = {
  design_suggestions: [
    'Для кухни в современном стиле рекомендую использовать ламинированное ДСП белого цвета',
    'Добавьте подсветку под навесными шкафами для лучшего освещения рабочей зоны',
    'Рассмотрите возможность установки выдвижных ящиков для удобного хранения'
  ],
  material_recommendations: [
    'Для детской мебели лучше использовать МДФ - материал безопасный и прочный',
    'Дуб подойдет для классического интерьера, но потребует больше ухода',
    'Ламинированное ДСП - оптимальный выбор по соотношению цена-качество'
  ]
};

// @route   POST /api/ai/suggest
// @desc    Get AI suggestions for furniture design
// @access  Private
router.post('/suggest', [
  body('roomType').optional().isIn(['living', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining']).withMessage('Invalid room type'),
  body('style').optional().isIn(['modern', 'classic', 'minimalist', 'rustic', 'industrial', 'scandinavian']).withMessage('Invalid style'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be positive'),
  body('dimensions').optional().isObject().withMessage('Dimensions must be an object'),
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

    // 1. Проверяем достаточность данных
    const hasRequiredData = roomType && style && budget && dimensions && 
                           dimensions.width && dimensions.height && dimensions.depth;

    if (!hasRequiredData) {
      const questions = [];
      if (!roomType) questions.push('Укажите тип комнаты (living, bedroom, kitchen, bathroom, office, dining)');
      if (!style) questions.push('Выберите стиль (modern, classic, minimalist, rustic, industrial, scandinavian)');
      if (!budget) questions.push('Укажите бюджет в рублях');
      if (!dimensions?.width) questions.push('Укажите ширину мебели в см');
      if (!dimensions?.height) questions.push('Укажите высоту мебели в см');
      if (!dimensions?.depth) questions.push('Укажите глубину мебели в см');
      
      return res.json({
        success: true,
        data: { questions },
        needMoreInfo: true
      });
    }

    // 2. Генерируем параметры модели с помощью GPT-4
    const aiPrompt = `Ты — эксперт по проектированию корпусной мебели. На основе входных данных создай оптимальные параметры для 3D-модели мебели.

Входные данные:
- Тип комнаты: ${roomType}
- Стиль: ${style}
- Бюджет: ${budget}₽
- Размеры: ${JSON.stringify(dimensions)}см
- Требования: ${requirements.join(', ')}

Верни JSON объект в следующем формате:
{
  "model": {
    "furnitureType": "cabinet|wardrobe|bookshelf|kitchen|table",
    "material": "oak|pine|birch|laminate_white|laminate_oak|veneer_oak|mdf_white|mdf_colored",
    "dimensions": {
      "width": число,
      "height": число,
      "depth": число
    },
    "features": {
      "shelves": число,
      "doors": число,
      "drawers": число,
      "legs": число (для столов),
      "cabinets": число (для кухни)
    },
    "hardware": {
      "hinges": "hidden|visible|soft_close",
      "handles": "simple|modern|recessed",
      "slides": "ball|roller|tandem"
    }
  },
  "advice": [
    "Совет 1 по сборке и дизайну",
    "Совет 2 по материалам",
    "Совет 3 по функциональности"
  ],
  "dalle_prompt": "Подробное описание мебели для генерации изображения на английском языке"
}

Учитывай:
- Бюджет при выборе материалов
- Стиль при выборе фурнитуры
- Размеры комнаты для оптимальных габаритов
- Функциональность для количества полок/ящиков`;

    // 3. Генерируем параметры (с OpenAI или fallback)
    let modelData = null;
    let advice = [];
    let dallePrompt = null;
    
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { 
              role: 'system', 
              content: 'Ты — эксперт по проектированию корпусной мебели. Ты создаешь точные параметры для 3D-модели и даешь профессиональные советы. Всегда возвращай валидный JSON.' 
            },
            { role: 'user', content: aiPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        let raw = completion.choices[0].message.content;
        
        // Ищем JSON в ответе
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          if (parsed.model) {
            modelData = parsed.model;
            advice = parsed.advice || [];
            dallePrompt = parsed.dalle_prompt;
            
            // Валидация и нормализация параметров
            modelData = validateAndNormalizeModel(modelData, budget);
          }
        }
      } catch (e) {
        console.error('OpenAI error:', e);
      }
    }
    
    // Fallback если OpenAI недоступен или произошла ошибка
    if (!modelData) {
      modelData = createFallbackModel(roomType, style, dimensions, budget);
      advice = [
        'Использованы базовые параметры (OpenAI недоступен)',
        'Рекомендуется проверить размеры и материалы',
        'Обратитесь к специалисту для уточнения деталей'
      ];
    }
    
    try {
      // Ищем JSON в ответе
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.model) {
          modelData = parsed.model;
          advice = parsed.advice || [];
          dallePrompt = parsed.dalle_prompt;
          
          // Валидация и нормализация параметров
          modelData = validateAndNormalizeModel(modelData, budget);
        }
      }
    } catch (e) {
      console.error('JSON parsing error:', e);
      // Fallback: создаем базовые параметры
      modelData = createFallbackModel(roomType, style, dimensions, budget);
      advice = [
        'Использованы базовые параметры из-за ошибки AI',
        'Рекомендуется проверить размеры и материалы',
        'Обратитесь к специалисту для уточнения деталей'
      ];
    }

    // 4. Генерируем изображение через DALL-E
    let imageUrl = null;
    if (dallePrompt) {
      try {
        const image = await openai.images.generate({
          prompt: dallePrompt,
          n: 1,
          size: '512x512'
        });
        imageUrl = image.data[0].url;
      } catch (e) {
        console.error('DALL-E generation error:', e);
        imageUrl = null;
      }
    }

    res.json({
      success: true,
      data: {
        model: modelData,
        advice,
        imageUrl
      }
    });

  } catch (error) {
    console.error('AI suggest error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI suggestions',
      error: error.message
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

// Get material recommendations
router.post('/materials', (req, res) => {
  try {
    const { furnitureType, budget, style } = req.body;
    
    const recommendations = mockAIResponses.material_recommendations.slice(0, 2);
    
    res.json({
      success: true,
      data: {
        recommendations,
        reasoning: 'Рекомендации основаны на характеристиках материалов и вашем бюджете'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating material recommendations',
      error: error.message
    });
  }
});

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

// Функция валидации и нормализации модели
function validateAndNormalizeModel(model, budget) {
  const normalized = { ...model };
  
  // Проверяем и корректируем размеры
  if (normalized.dimensions) {
    normalized.dimensions.width = Math.max(50, Math.min(400, normalized.dimensions.width));
    normalized.dimensions.height = Math.max(100, Math.min(300, normalized.dimensions.height));
    normalized.dimensions.depth = Math.max(30, Math.min(120, normalized.dimensions.depth));
  }
  
  // Проверяем и корректируем элементы
  if (normalized.features) {
    normalized.features.shelves = Math.max(0, Math.min(10, normalized.features.shelves || 0));
    normalized.features.doors = Math.max(0, Math.min(6, normalized.features.doors || 0));
    normalized.features.drawers = Math.max(0, Math.min(8, normalized.features.drawers || 0));
  }
  
  // Корректируем материал в зависимости от бюджета
  if (budget < 10000) {
    normalized.material = 'laminate_white';
  } else if (budget < 30000) {
    normalized.material = 'mdf_white';
  } else if (budget < 50000) {
    normalized.material = 'birch';
  } else {
    normalized.material = 'oak';
  }
  
  return normalized;
}

// Функция создания fallback модели
function createFallbackModel(roomType, style, dimensions, budget) {
  const furnitureTypeMap = {
    'living': 'cabinet',
    'bedroom': 'wardrobe',
    'kitchen': 'kitchen',
    'bathroom': 'cabinet',
    'office': 'bookshelf',
    'dining': 'table'
  };
  
  const materialMap = {
    'modern': 'laminate_white',
    'classic': 'oak',
    'minimalist': 'mdf_white',
    'rustic': 'pine',
    'industrial': 'birch',
    'scandinavian': 'laminate_white'
  };
  
  return {
    furnitureType: furnitureTypeMap[roomType] || 'cabinet',
    material: materialMap[style] || 'laminate_white',
    dimensions: {
      width: dimensions.width || 100,
      height: dimensions.height || 200,
      depth: dimensions.depth || 60
    },
    features: {
      shelves: 3,
      doors: 2,
      drawers: 1
    },
    hardware: {
      hinges: 'hidden',
      handles: 'simple',
      slides: 'ball'
    }
  };
}

export default router; 