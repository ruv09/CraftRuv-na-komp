import express from 'express';
const router = express.Router();

// Материалы с ценами за кв.м
const materials = {
  oak: { name: 'Дуб', pricePerSqm: 2500, category: 'wood' },
  pine: { name: 'Сосна', pricePerSqm: 1200, category: 'wood' },
  birch: { name: 'Береза', pricePerSqm: 1800, category: 'wood' },
  laminate_white: { name: 'Ламинированное ДСП белое', pricePerSqm: 800, category: 'laminate' },
  laminate_oak: { name: 'Ламинированное ДСП под дуб', pricePerSqm: 950, category: 'laminate' },
  veneer_oak: { name: 'Шпон дуба', pricePerSqm: 1500, category: 'veneer' },
  mdf_white: { name: 'МДФ белое', pricePerSqm: 600, category: 'mdf' },
  mdf_colored: { name: 'МДФ цветное', pricePerSqm: 750, category: 'mdf' },
};

// Типы мебели с коэффициентами сложности
const furnitureTypes = {
  cabinet: { name: 'Шкаф', description: 'Корпусный шкаф с дверцами', baseMultiplier: 1.0 },
  kitchen: { name: 'Кухонный гарнитур', description: 'Кухонные шкафы с фурнитурой', baseMultiplier: 1.3 },
  wardrobe: { name: 'Гардероб', description: 'Встроенный гардероб', baseMultiplier: 1.1 },
  bookshelf: { name: 'Книжный шкаф', description: 'Полки для книг', baseMultiplier: 0.8 },
  tv_stand: { name: 'ТВ-тумба', description: 'Тумба под телевизор', baseMultiplier: 0.9 },
};

// Получить список материалов
router.get('/materials', (req, res) => {
  try {
    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка материалов',
      error: error.message
    });
  }
});

// Получить список типов мебели
router.get('/furniture-types', (req, res) => {
  try {
    res.json({
      success: true,
      data: furnitureTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении типов мебели',
      error: error.message
    });
  }
});

// Рассчитать стоимость мебели
router.post('/calculate', (req, res) => {
  try {
    const { furnitureType, material, dimensions } = req.body;

    // Валидация входных данных
    if (!furnitureType || !material || !dimensions) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать тип мебели, материал и размеры'
      });
    }

    const { width, height, depth } = dimensions;
    if (!width || !height || !depth) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать все размеры (ширина, высота, глубина)'
      });
    }

    // Проверка существования материала и типа мебели
    if (!materials[material]) {
      return res.status(400).json({
        success: false,
        message: 'Указанный материал не найден'
      });
    }

    if (!furnitureTypes[furnitureType]) {
      return res.status(400).json({
        success: false,
        message: 'Указанный тип мебели не найден'
      });
    }

    const selectedMaterial = materials[material];
    const selectedFurnitureType = furnitureTypes[furnitureType];

    // Расчет площади (примерно 2.5 площади поверхности для корпусной мебели)
    const area = (width * height * 2 + width * depth * 2 + height * depth * 2) / 10000; // в кв.м
    const adjustedArea = area * 2.5; // коэффициент для учета внутренних деталей

    // Расчет стоимости
    const materialCost = adjustedArea * selectedMaterial.pricePerSqm;
    const laborCost = adjustedArea * 1500; // 1500 руб за кв.м работы
    const totalCost = (materialCost + laborCost) * selectedFurnitureType.baseMultiplier;

    // Дополнительные опции
    const options = {
      delivery: totalCost * 0.05, // 5% от стоимости за доставку
      assembly: totalCost * 0.1, // 10% от стоимости за сборку
      warranty: totalCost * 0.02, // 2% от стоимости за гарантию
    };

    const result = {
      area: adjustedArea,
      materialCost,
      laborCost,
      totalCost,
      options,
      totalWithOptions: totalCost + options.delivery + options.assembly + options.warranty,
      materialName: selectedMaterial.name,
      furnitureTypeName: selectedFurnitureType.name,
      dimensions: {
        width,
        height,
        depth
      },
      calculationDate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при расчете стоимости',
      error: error.message
    });
  }
});

// Получить детальную информацию о материале
router.get('/materials/:materialId', (req, res) => {
  try {
    const { materialId } = req.params;
    
    if (!materials[materialId]) {
      return res.status(404).json({
        success: false,
        message: 'Материал не найден'
      });
    }

    res.json({
      success: true,
      data: materials[materialId]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении информации о материале',
      error: error.message
    });
  }
});

// Получить детальную информацию о типе мебели
router.get('/furniture-types/:typeId', (req, res) => {
  try {
    const { typeId } = req.params;
    
    if (!furnitureTypes[typeId]) {
      return res.status(404).json({
        success: false,
        message: 'Тип мебели не найден'
      });
    }

    res.json({
      success: true,
      data: furnitureTypes[typeId]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении информации о типе мебели',
      error: error.message
    });
  }
});

export default router; 