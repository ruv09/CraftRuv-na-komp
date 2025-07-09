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

    // 1. Сначала просим GPT-4: если данных мало — вернуть вопросы, если достаточно — параметры и советы
    const infoPrompt = `Ты — эксперт по проектированию корпусной мебели. Если данных недостаточно для проектирования (нет типа, стиля, бюджета, размеров), верни массив уточняющих вопросов в формате { "questions": [ ... ] }. Если данных достаточно, верни объект:
{
  "model": { ... параметры для 3D-модели ... },
  "advice": [ ... советы по сборке ... ],
  "dalle_prompt": "...описание для генерации изображения..."
}

Входные данные:
Тип комнаты: ${roomType || ''}
Стиль: ${style || ''}
Бюджет: ${budget || ''}
Размеры: ${dimensions ? JSON.stringify(dimensions) : ''}
Требования: ${requirements.length ? requirements.join(', ') : ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Ты — эксперт по проектированию корпусной мебели. Ты помогаешь создавать параметры для 3D-модели, советы по сборке и промпт для генерации изображения.' },
        { role: 'user', content: infoPrompt }
      ],
      temperature: 0.7,
      max_tokens: 900
    });

    // 2. Пробуем распарсить ответ
    let modelData = null;
    let advice = [];
    let dallePrompt = null;
    let questions = null;
    let raw = completion.choices[0].message.content;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.questions) {
          questions = parsed.questions;
        } else {
          modelData = parsed.model;
          advice = parsed.advice;
          dallePrompt = parsed.dalle_prompt;
        }
      }
    } catch (e) {
      // fallback: просто текст
      return res.json({
        success: true,
        data: {
          raw
        },
        warning: 'Не удалось распарсить JSON, проверьте формат ответа.'
      });
    }

    // 3. Если нужны уточняющие вопросы — возвращаем их
    if (questions) {
      return res.json({
        success: true,
        data: {
          questions
        },
        needMoreInfo: true
      });
    }

    // 4. Генерируем изображение через DALL-E, если есть промпт
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
        // Если не удалось — просто продолжаем
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

export default router; 