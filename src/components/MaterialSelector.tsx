import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Info, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Input } from './ui/input';

interface Material {
  id: string;
  name: string;
  type: 'wood' | 'laminate' | 'mdf' | 'veneer' | 'metal' | 'glass' | 'plastic';
  price: number; // цена за м²
  density: number; // плотность кг/м³
  color: string; // HEX код цвета
  textureUrl?: string; // URL текстуры
  description?: string; // описание материала
  properties?: {
    waterResistant?: boolean;
    scratchResistant?: boolean;
    heatResistant?: boolean;
    ecofriendly?: boolean;
  };
}

interface MaterialSelectorProps {
  selectedMaterial: string;
  onMaterialChange: (materialId: string) => void;
  onTextureChange?: (textureUrl: string) => void;
}

const MATERIALS: Material[] = [
  {
    id: 'oak',
    name: 'Дуб',
    type: 'wood',
    price: 5000,
    density: 750,
    color: '#8B4513',
    textureUrl: '/textures/oak.jpg',
    description: 'Прочная древесина с выраженной текстурой, отлично подходит для долговечной мебели',
    properties: {
      waterResistant: false,
      scratchResistant: true,
      heatResistant: true,
      ecofriendly: true
    }
  },
  {
    id: 'pine',
    name: 'Сосна',
    type: 'wood',
    price: 2500,
    density: 550,
    color: '#DEB887',
    textureUrl: '/textures/pine.jpg',
    description: 'Мягкая древесина светлого оттенка, доступная по цене',
    properties: {
      waterResistant: false,
      scratchResistant: false,
      heatResistant: true,
      ecofriendly: true
    }
  },
  {
    id: 'birch',
    name: 'Берёза',
    type: 'wood',
    price: 3000,
    density: 650,
    color: '#F5DEB3',
    textureUrl: '/textures/birch.jpg',
    description: 'Светлая древесина средней твердости с однородной структурой',
    properties: {
      waterResistant: false,
      scratchResistant: true,
      heatResistant: true,
      ecofriendly: true
    }
  },
  {
    id: 'laminate_white',
    name: 'ЛДСП белый',
    type: 'laminate',
    price: 1500,
    density: 720,
    color: '#FFFFFF',
    textureUrl: '/textures/laminate_white.jpg',
    description: 'Ламинированная ДСП белого цвета, практичный и доступный материал',
    properties: {
      waterResistant: true,
      scratchResistant: true,
      heatResistant: false,
      ecofriendly: false
    }
  },
  {
    id: 'laminate_oak',
    name: 'ЛДСП дуб',
    type: 'laminate',
    price: 1800,
    density: 720,
    color: '#8B4513',
    textureUrl: '/textures/laminate_oak.jpg',
    description: 'Ламинированная ДСП с имитацией текстуры дуба',
    properties: {
      waterResistant: true,
      scratchResistant: true,
      heatResistant: false,
      ecofriendly: false
    }
  },
  {
    id: 'mdf_white',
    name: 'МДФ белый',
    type: 'mdf',
    price: 2200,
    density: 800,
    color: '#FFFFFF',
    textureUrl: '/textures/mdf_white.jpg',
    description: 'МДФ с белым покрытием, более прочный чем ЛДСП',
    properties: {
      waterResistant: true,
      scratchResistant: true,
      heatResistant: true,
      ecofriendly: false
    }
  },
  {
    id: 'glass_clear',
    name: 'Стекло прозрачное',
    type: 'glass',
    price: 4000,
    density: 2500,
    color: '#FFFFFF',
    textureUrl: '/textures/glass_clear.jpg',
    description: 'Прозрачное стекло для фасадов и полок',
    properties: {
      waterResistant: true,
      scratchResistant: false,
      heatResistant: true,
      ecofriendly: true
    }
  },
  {
    id: 'metal_chrome',
    name: 'Металл хром',
    type: 'metal',
    price: 6000,
    density: 7800,
    color: '#C0C0C0',
    textureUrl: '/textures/metal_chrome.jpg',
    description: 'Хромированный металл для элементов мебели',
    properties: {
      waterResistant: true,
      scratchResistant: true,
      heatResistant: true,
      ecofriendly: true
    }
  }
];

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
  onTextureChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('materials');
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>(MATERIALS);
  const [selectedTexture, setSelectedTexture] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Текущий выбранный материал
  const currentMaterial = MATERIALS.find(m => m.id === selectedMaterial) || MATERIALS[0];

  // Фильтрация материалов
  useEffect(() => {
    let filtered = MATERIALS;
    
    // Фильтр по поиску
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Фильтр по типу
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.type === selectedType);
    }
    
    // Фильтр по цене
    filtered = filtered.filter(m => 
      m.price >= priceRange[0] && m.price <= priceRange[1]
    );
    
    setFilteredMaterials(filtered);
  }, [searchTerm, selectedType, priceRange]);

  // Обработчик выбора текстуры
  const handleTextureSelect = (textureUrl: string) => {
    setSelectedTexture(textureUrl);
    if (onTextureChange) {
      onTextureChange(textureUrl);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Материалы и текстуры
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Выберите материал и текстуру для вашей мебели. Разные материалы имеют различные свойства и стоимость.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materials">Материалы</TabsTrigger>
            <TabsTrigger value="textures">Текстуры</TabsTrigger>
          </TabsList>
          
          <TabsContent value="materials" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск материалов..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedType === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType('all')}
              >
                Все
              </Badge>
              <Badge 
                variant={selectedType === 'wood' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType('wood')}
              >
                Дерево
              </Badge>
              <Badge 
                variant={selectedType === 'laminate' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType('laminate')}
              >
                ЛДСП
              </Badge>
              <Badge 
                variant={selectedType === 'mdf' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType('mdf')}
              >
                МДФ
              </Badge>
              <Badge 
                variant={selectedType === 'glass' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType('glass')}
              >
                Стекло
              </Badge>
              <Badge 
                variant={selectedType === 'metal' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType('metal')}
              >
                Металл
              </Badge>
            </div>
            
            <div>
              <Label className="text-xs">Диапазон цен (₽/м²)</Label>
              <div className="flex items-center space-x-2">
                <span className="text-xs">{priceRange[0]}</span>
                <Slider
                  value={priceRange}
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="flex-1"
                />
                <span className="text-xs">{priceRange[1]}</span>
              </div>
            </div>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredMaterials.map((material) => (
                  <div 
                    key={material.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedMaterial === material.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => onMaterialChange(material.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{
                          backgroundColor: material.color,
                          backgroundImage: material.textureUrl ? `url(${material.textureUrl})` : undefined,
                          backgroundSize: 'cover'
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{material.name}</div>
                        <div className="text-xs opacity-70">{material.price} ₽/м²</div>
                      </div>
                    </div>
                    {selectedMaterial === material.id && (
                      <div className="mt-2 text-xs">
                        <p>{material.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {material.properties?.waterResistant && (
                            <Badge variant="secondary" className="text-[10px]">Влагостойкий</Badge>
                          )}
                          {material.properties?.scratchResistant && (
                            <Badge variant="secondary" className="text-[10px]">Устойчив к царапинам</Badge>
                          )}
                          {material.properties?.heatResistant && (
                            <Badge variant="secondary" className="text-[10px]">Термостойкий</Badge>
                          )}
                          {material.properties?.ecofriendly && (
                            <Badge variant="secondary" className="text-[10px]">Экологичный</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {filteredMaterials.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Материалы не найдены
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="textures" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {currentMaterial.textureUrl && (
                <div 
                  className={`aspect-square rounded-lg border-2 ${selectedTexture === currentMaterial.textureUrl ? 'border-primary' : 'border-border'}`}
                  style={{
                    backgroundImage: `url(${currentMaterial.textureUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={() => handleTextureSelect(currentMaterial.textureUrl!)}
                />
              )}
              <div 
                className={`aspect-square rounded-lg border-2 ${selectedTexture === undefined ? 'border-primary' : 'border-border'}`}
                style={{
                  backgroundColor: currentMaterial.color
                }}
                onClick={() => handleTextureSelect('')}
              />
              {/* Здесь можно добавить дополнительные текстуры для каждого материала */}
            </div>
            
            <div className="mt-4">
              <Label className="text-xs mb-2 block">Предпросмотр материала</Label>
              <div className="aspect-video rounded-lg overflow-hidden border">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundColor: currentMaterial.color,
                    backgroundImage: selectedTexture ? `url(${selectedTexture})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MaterialSelector;