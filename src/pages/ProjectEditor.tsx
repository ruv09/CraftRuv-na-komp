import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import Furniture3DViewer from '../components/Furniture3DViewer';
import CNCExporter from '../components/CNCExporter';
import ProjectStats from '../components/ProjectStats';
import { 
  Bot, 
  Settings, 
  Save, 
  Download, 
  Calculator, 
  Eye, 
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Типы мебели с параметрами
const FURNITURE_TYPES = {
  cabinet: {
    name: 'Шкаф',
    defaultParams: { width: 100, height: 200, depth: 60, shelves: 3, doors: 2 },
    features: ['Полки', 'Двери', 'Ящики', 'Штанга для одежды']
  },
  wardrobe: {
    name: 'Гардероб',
    defaultParams: { width: 200, height: 240, depth: 60, shelves: 4, doors: 3, drawers: 2 },
    features: ['Полки', 'Двери', 'Ящики', 'Штанга', 'Зеркало']
  },
  bookshelf: {
    name: 'Книжный шкаф',
    defaultParams: { width: 120, height: 200, depth: 30, shelves: 6 },
    features: ['Полки', 'Задняя стенка', 'Регулируемые полки']
  },
  kitchen: {
    name: 'Кухонный гарнитур',
    defaultParams: { width: 300, height: 85, depth: 60, cabinets: 3, drawers: 2 },
    features: ['Шкафы', 'Ящики', 'Столешница', 'Фасады']
  },
  table: {
    name: 'Стол',
    defaultParams: { width: 120, height: 75, depth: 60, legs: 4 },
    features: ['Столешница', 'Ножки', 'Ящик']
  }
};

// Материалы с характеристиками
const MATERIALS = {
  oak: { name: 'Дуб', price: 1500, density: 750, color: '#8B4513' },
  pine: { name: 'Сосна', price: 800, density: 520, color: '#DEB887' },
  birch: { name: 'Берёза', price: 1200, density: 650, color: '#F5DEB3' },
  laminate_white: { name: 'ЛДСП белый', price: 400, density: 650, color: '#FFFFFF' },
  laminate_oak: { name: 'ЛДСП под дуб', price: 500, density: 650, color: '#8B4513' },
  veneer_oak: { name: 'Шпон дуб', price: 800, density: 650, color: '#8B4513' },
  mdf_white: { name: 'МДФ белый', price: 300, density: 750, color: '#FFFFFF' },
  mdf_colored: { name: 'МДФ цветной', price: 400, density: 750, color: '#F0F0F0' }
};

// Фурнитура
const HARDWARE = {
  hinges: [
    { id: 'hidden', name: 'Скрытые петли', price: 150 },
    { id: 'visible', name: 'Видимые петли', price: 80 },
    { id: 'soft_close', name: 'Петли с доводчиком', price: 250 }
  ],
  handles: [
    { id: 'simple', name: 'Простая ручка', price: 50 },
    { id: 'modern', name: 'Современная ручка', price: 120 },
    { id: 'recessed', name: 'Врезная ручка', price: 80 }
  ],
  slides: [
    { id: 'ball', name: 'Шариковые направляющие', price: 200 },
    { id: 'roller', name: 'Роликовые направляющие', price: 150 },
    { id: 'tandem', name: 'Тандемные направляющие', price: 350 }
  ]
};

interface ProjectData {
  id?: string;
  name: string;
  description: string;
  furnitureType: string;
  material: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  features: {
    shelves: number;
    doors: number;
    drawers: number;
    legs?: number;
    cabinets?: number;
  };
  hardware: {
    hinges: string;
    handles: string;
    slides: string;
  };
  aiGenerated: boolean;
  aiAdvice: string[];
  cost: number;
  createdAt?: Date;
}

export default function ProjectEditor() {
  const [project, setProject] = useState<ProjectData>({
    name: '',
    description: '',
    furnitureType: 'cabinet',
    material: 'oak',
    dimensions: { width: 100, height: 200, depth: 60 },
    features: { shelves: 3, doors: 2, drawers: 0 },
    hardware: { hinges: 'hidden', handles: 'simple', slides: 'ball' },
    aiGenerated: false,
    aiAdvice: [],
    cost: 0
  });

  const [aiState, setAiState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('design');
  const [showAI, setShowAI] = useState(false);

  // Обновление параметров при смене типа мебели
  useEffect(() => {
    const type = FURNITURE_TYPES[project.furnitureType as keyof typeof FURNITURE_TYPES];
    if (type) {
      const defaultParams = type.defaultParams as any;
      setProject(prev => ({
        ...prev,
        dimensions: { 
          width: defaultParams.width || 100,
          height: defaultParams.height || 200,
          depth: defaultParams.depth || 60
        },
        features: {
          shelves: defaultParams.shelves || 0,
          doors: defaultParams.doors || 0,
          drawers: defaultParams.drawers || 0,
          legs: defaultParams.legs,
          cabinets: defaultParams.cabinets
        }
      }));
    }
  }, [project.furnitureType]);

  // Расчет стоимости
  useEffect(() => {
    calculateCost();
  }, [project]);

  const calculateCost = () => {
    const material = MATERIALS[project.material as keyof typeof MATERIALS];
    const volume = (project.dimensions.width * project.dimensions.height * project.dimensions.depth) / 1000000; // м³
    const materialCost = volume * material.price * 1000; // переводим в см³
    
    const hardwareCost = 
      HARDWARE.hinges.find(h => h.id === project.hardware.hinges)?.price * project.features.doors +
      HARDWARE.handles.find(h => h.id === project.hardware.handles)?.price * (project.features.doors + project.features.drawers) +
      HARDWARE.slides.find(h => h.id === project.hardware.slides)?.price * project.features.drawers;

    const totalCost = materialCost + hardwareCost + 2000; // + 2000 за работу
    setProject(prev => ({ ...prev, cost: Math.round(totalCost) }));
  };

  // ИИ генерация параметров
  const generateWithAI = async () => {
    setAiState('loading');
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomType: 'living',
          style: 'modern',
          budget: project.cost,
          dimensions: project.dimensions,
          requirements: ['функциональность', 'современный дизайн']
        })
      });

      const data = await response.json();
      
      if (data.success && data.data.model) {
        const aiModel = data.data.model;
        setProject(prev => ({
          ...prev,
          dimensions: aiModel.dimensions || prev.dimensions,
          material: aiModel.material || prev.material,
          furnitureType: aiModel.furnitureType || prev.furnitureType,
          aiGenerated: true,
          aiAdvice: data.data.advice || []
        }));
        setAiState('success');
      } else {
        setAiState('error');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setAiState('error');
    }
  };

  // Экспорт проекта
  const exportProject = (format: 'json' | 'dxf' | 'cnc') => {
    const projectData = {
      ...project,
      exportFormat: format,
      exportDate: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name || 'project'}.json`;
      a.click();
    } else {
      // Здесь будет генерация DXF или CNC кода
      alert(`Экспорт в ${format.toUpperCase()} будет добавлен в следующей версии`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Редактор проектов</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Создание и редактирование проектов корпусной мебели с ИИ-ассистентом
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAI(!showAI)}>
            <Bot className="h-4 w-4 mr-2" />
            ИИ-ассистент
          </Button>
          <Button onClick={() => exportProject('json')}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая панель - Параметры */}
        <div className="lg:col-span-1 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design">Дизайн</TabsTrigger>
              <TabsTrigger value="materials">Материалы</TabsTrigger>
              <TabsTrigger value="hardware">Фурнитура</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Основные параметры
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Название проекта</Label>
                    <Input 
                      value={project.name} 
                      onChange={e => setProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Мой проект мебели"
                    />
                  </div>

                  <div>
                    <Label>Описание</Label>
                    <Textarea 
                      value={project.description} 
                      onChange={e => setProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Описание проекта..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Тип мебели</Label>
                    <Select value={project.furnitureType} onValueChange={value => setProject(prev => ({ ...prev, furnitureType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FURNITURE_TYPES).map(([key, type]) => (
                          <SelectItem key={key} value={key}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Ширина (см)</Label>
                      <Input 
                        type="number" 
                        value={project.dimensions.width} 
                        onChange={e => setProject(prev => ({ 
                          ...prev, 
                          dimensions: { ...prev.dimensions, width: Number(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Высота (см)</Label>
                      <Input 
                        type="number" 
                        value={project.dimensions.height} 
                        onChange={e => setProject(prev => ({ 
                          ...prev, 
                          dimensions: { ...prev.dimensions, height: Number(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Глубина (см)</Label>
                      <Input 
                        type="number" 
                        value={project.dimensions.depth} 
                        onChange={e => setProject(prev => ({ 
                          ...prev, 
                          dimensions: { ...prev.dimensions, depth: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Элементы мебели</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label className="text-sm">Полки</Label>
                        <Input 
                          type="number" 
                          value={project.features.shelves} 
                          onChange={e => setProject(prev => ({ 
                            ...prev, 
                            features: { ...prev.features, shelves: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Двери</Label>
                        <Input 
                          type="number" 
                          value={project.features.doors} 
                          onChange={e => setProject(prev => ({ 
                            ...prev, 
                            features: { ...prev.features, doors: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Ящики</Label>
                        <Input 
                          type="number" 
                          value={project.features.drawers} 
                          onChange={e => setProject(prev => ({ 
                            ...prev, 
                            features: { ...prev.features, drawers: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Материалы
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Основной материал</Label>
                    <Select value={project.material} onValueChange={value => setProject(prev => ({ ...prev, material: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MATERIALS).map(([key, material]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border" 
                                style={{ backgroundColor: material.color }}
                              />
                              {material.name} - {material.price}₽/м²
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Характеристики материала</h4>
                    {(() => {
                      const material = MATERIALS[project.material as keyof typeof MATERIALS];
                      return (
                        <div className="space-y-1 text-sm">
                          <div>Плотность: {material.density} кг/м³</div>
                          <div>Цена: {material.price}₽/м²</div>
                          <div>Цвет: {material.name}</div>
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hardware" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Фурнитура
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Петли</Label>
                    <Select value={project.hardware.hinges} onValueChange={value => setProject(prev => ({ 
                      ...prev, 
                      hardware: { ...prev.hardware, hinges: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HARDWARE.hinges.map(hinge => (
                          <SelectItem key={hinge.id} value={hinge.id}>
                            {hinge.name} - {hinge.price}₽
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Ручки</Label>
                    <Select value={project.hardware.handles} onValueChange={value => setProject(prev => ({ 
                      ...prev, 
                      hardware: { ...prev.hardware, handles: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HARDWARE.handles.map(handle => (
                          <SelectItem key={handle.id} value={handle.id}>
                            {handle.name} - {handle.price}₽
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Направляющие</Label>
                    <Select value={project.hardware.slides} onValueChange={value => setProject(prev => ({ 
                      ...prev, 
                      hardware: { ...prev.hardware, slides: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HARDWARE.slides.map(slide => (
                          <SelectItem key={slide.id} value={slide.id}>
                            {slide.name} - {slide.price}₽
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* ИИ-ассистент */}
          {showAI && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  ИИ-ассистент
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={generateWithAI} 
                  disabled={aiState === 'loading'}
                  className="w-full"
                >
                  {aiState === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ИИ думает...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Оптимизировать с ИИ
                    </>
                  )}
                </Button>

                {aiState === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Параметры оптимизированы!</span>
                  </div>
                )}

                {aiState === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Ошибка ИИ</span>
                  </div>
                )}

                {project.aiGenerated && project.aiAdvice.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Советы ИИ:</Label>
                    <div className="space-y-1">
                      {project.aiAdvice.map((advice, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          {advice}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Расчет стоимости */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Расчет стоимости
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {project.cost.toLocaleString()} ₽
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Включая материалы, фурнитуру и работу
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Центральная панель - 3D визуализация */}
        <div className="lg:col-span-2">
          <Card className="h-full mb-6">
            <CardHeader>
              <CardTitle>3D визуализация</CardTitle>
              <CardDescription>
                {FURNITURE_TYPES[project.furnitureType as keyof typeof FURNITURE_TYPES]?.name} - 
                {MATERIALS[project.material as keyof typeof MATERIALS]?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <Furniture3DViewer
                width={project.dimensions.width}
                height={project.dimensions.height}
                depth={project.dimensions.depth}
                furnitureType={project.furnitureType}
                material={project.material}
                features={project.features}
              />
            </CardContent>
          </Card>

          {/* CNC Экспортер */}
          <CNCExporter 
            project={project}
            onExport={(format, machine) => {
              console.log(`Экспорт в ${format} для станка ${machine}`);
              // Здесь будет логика экспорта
              alert(`Экспорт в ${format} для станка ${machine} будет добавлен в следующей версии`);
            }}
          />

          {/* Статистика проекта */}
          <ProjectStats 
            project={project}
            aiOptimization={project.aiGenerated ? {
              costReduction: 15,
              materialEfficiency: 85,
              timeSaved: 20,
              suggestions: project.aiAdvice
            } : undefined}
          />
        </div>
      </div>
    </div>
  );
} 