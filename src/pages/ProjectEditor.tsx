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
import MaterialTextureSelector from '../components/MaterialTextureSelector';
import CNCExporter from '../components/CNCExporter';
import ProjectStats from '../components/ProjectStats';
import Workspace from '../components/Workspace';
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
  textureUrl?: string;
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
    textureUrl: undefined,
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
          textureUrl: aiModel.textureUrl || prev.textureUrl,
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
    <Workspace 
      project={project}
      onProjectChange={setProject}
      onSave={() => console.log('Сохранение проекта')}
      onExport={(format) => exportProject(format as 'json' | 'dxf' | 'cnc')}
    >
      {/* 3D визуализация в центральной панели */}
      <div className="h-full flex flex-col">
              <MaterialTextureSelector
                initialMaterial={project.material}
                furnitureType={project.furnitureType}
                dimensions={project.dimensions}
                features={project.features}
                onMaterialChange={(materialId) => {
                  setProject(prev => ({
                    ...prev,
                    material: materialId
                  }));
                }}
                onTextureChange={(textureUrl) => {
                  setProject(prev => ({
                    ...prev,
                    textureUrl: textureUrl
                  }));
                }}
                onDimensionsChange={(dimensions) => {
                  setProject(prev => ({
                    ...prev,
                    dimensions
                  }));
                }}
              />

        {/* Дополнительные компоненты */}
        <div className="mt-4 space-y-4">
          <CNCExporter 
            project={project}
            onExport={(format, machine) => {
              console.log(`Экспорт в ${format} для станка ${machine}`);
              alert(`Экспорт в ${format} для станка ${machine} будет добавлен в следующей версии`);
            }}
          />

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
    </Workspace>
  );
} 