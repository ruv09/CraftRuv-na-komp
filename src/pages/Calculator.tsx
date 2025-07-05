import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calculator as CalculatorIcon, Ruler, Package, DollarSign, Settings, Loader2, Eye3d } from 'lucide-react';
import { toast } from 'sonner';
import Furniture3DViewer from '../components/Furniture3DViewer';

interface Material {
  id: string;
  name: string;
  pricePerSqm: number;
  category: 'wood' | 'laminate' | 'veneer' | 'mdf';
}

interface FurnitureType {
  id: string;
  name: string;
  description: string;
  baseMultiplier: number;
}

interface CalculationResult {
  area: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  options: {
    delivery: number;
    assembly: number;
    warranty: number;
  };
  totalWithOptions: number;
  materialName: string;
  furnitureTypeName: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  calculationDate: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function Calculator() {
  const [furnitureType, setFurnitureType] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [dimensions, setDimensions] = useState({
    width: '',
    height: '',
    depth: '',
  });
  const [materials, setMaterials] = useState<Record<string, Material>>({});
  const [furnitureTypes, setFurnitureTypes] = useState<Record<string, FurnitureType>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('calculator');

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        
        // Загружаем материалы и типы мебели параллельно
        const [materialsResponse, furnitureTypesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/calculator/materials`),
          fetch(`${API_BASE_URL}/calculator/furniture-types`)
        ]);

        if (materialsResponse.ok && furnitureTypesResponse.ok) {
          const materialsData = await materialsResponse.json();
          const furnitureTypesData = await furnitureTypesResponse.json();
          
          setMaterials(materialsData.data);
          setFurnitureTypes(furnitureTypesData.data);
        } else {
          throw new Error('Не удалось загрузить данные');
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        toast.error('Не удалось загрузить данные калькулятора');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  const calculateCost = async () => {
    if (!furnitureType || !material || !dimensions.width || !dimensions.height || !dimensions.depth) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/calculator/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          furnitureType,
          material,
          dimensions: {
            width: parseFloat(dimensions.width),
            height: parseFloat(dimensions.height),
            depth: parseFloat(dimensions.depth),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
        toast.success('Расчет выполнен успешно!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка расчета');
      }
    } catch (error) {
      console.error('Ошибка расчета:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка расчета стоимости');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCalculator = () => {
    setFurnitureType('');
    setMaterial('');
    setDimensions({ width: '', height: '', depth: '' });
    setResult(null);
  };

  const canShow3D = furnitureType && material && dimensions.width && dimensions.height && dimensions.depth;

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка калькулятора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Калькулятор корпусной мебели
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Рассчитайте стоимость и создайте 3D-модель корпусной мебели
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Калькулятор
            </TabsTrigger>
            <TabsTrigger value="3d-viewer" className="flex items-center gap-2" disabled={!canShow3D}>
              <Eye3d className="h-4 w-4" />
              3D Модель
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Форма расчета */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalculatorIcon className="h-5 w-5" />
                    Параметры мебели
                  </CardTitle>
                  <CardDescription>
                    Введите размеры и выберите материалы для расчета
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Тип мебели */}
                  <div className="space-y-2">
                    <Label htmlFor="furniture-type">Тип мебели</Label>
                    <Select value={furnitureType} onValueChange={setFurnitureType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип мебели" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(furnitureTypes).map(([id, type]) => (
                          <SelectItem key={id} value={id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {furnitureType && furnitureTypes[furnitureType] && (
                      <p className="text-sm text-gray-500">
                        {furnitureTypes[furnitureType].description}
                      </p>
                    )}
                  </div>

                  {/* Материал */}
                  <div className="space-y-2">
                    <Label htmlFor="material">Материал</Label>
                    <Select value={material} onValueChange={setMaterial}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите материал" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" disabled>Выберите материал</SelectItem>
                        <SelectItem value="wood" disabled>Натуральное дерево</SelectItem>
                        {Object.entries(materials)
                          .filter(([_, mat]) => mat.category === 'wood')
                          .map(([id, mat]) => (
                            <SelectItem key={id} value={id}>
                              {mat.name} - {mat.pricePerSqm} ₽/м²
                            </SelectItem>
                          ))}
                        <SelectItem value="laminate" disabled>Ламинированное ДСП</SelectItem>
                        {Object.entries(materials)
                          .filter(([_, mat]) => mat.category === 'laminate')
                          .map(([id, mat]) => (
                            <SelectItem key={id} value={id}>
                              {mat.name} - {mat.pricePerSqm} ₽/м²
                            </SelectItem>
                          ))}
                        <SelectItem value="veneer" disabled>Шпон</SelectItem>
                        {Object.entries(materials)
                          .filter(([_, mat]) => mat.category === 'veneer')
                          .map(([id, mat]) => (
                            <SelectItem key={id} value={id}>
                              {mat.name} - {mat.pricePerSqm} ₽/м²
                            </SelectItem>
                          ))}
                        <SelectItem value="mdf" disabled>МДФ</SelectItem>
                        {Object.entries(materials)
                          .filter(([_, mat]) => mat.category === 'mdf')
                          .map(([id, mat]) => (
                            <SelectItem key={id} value={id}>
                              {mat.name} - {mat.pricePerSqm} ₽/м²
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Размеры */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Размеры (см)
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="width">Ширина</Label>
                        <Input
                          id="width"
                          type="number"
                          placeholder="0"
                          value={dimensions.width}
                          onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Высота</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="0"
                          value={dimensions.height}
                          onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="depth">Глубина</Label>
                        <Input
                          id="depth"
                          type="number"
                          placeholder="0"
                          value={dimensions.depth}
                          onChange={(e) => setDimensions({ ...dimensions, depth: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Кнопки */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={calculateCost} 
                      className="flex-1" 
                      disabled={!furnitureType || !material || !dimensions.width || !dimensions.height || !dimensions.depth || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Расчет...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Рассчитать стоимость
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetCalculator}>
                      <Settings className="h-4 w-4 mr-2" />
                      Сбросить
                    </Button>
                  </div>

                  {/* Кнопка 3D просмотра */}
                  {canShow3D && (
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('3d-viewer')}
                      className="w-full"
                    >
                      <Eye3d className="h-4 w-4 mr-2" />
                      Посмотреть 3D модель
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Результат расчета */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Результат расчета
                  </CardTitle>
                  <CardDescription>
                    Детальная стоимость вашей мебели
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-6">
                      {/* Основная информация */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Тип мебели:</span>
                          <Badge variant="secondary">{result.furnitureTypeName}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Материал:</span>
                          <Badge variant="outline">{result.materialName}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Площадь материала:</span>
                          <span className="font-medium">{result.area.toFixed(2)} м²</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Стоимость */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Стоимость материалов:</span>
                          <span className="font-medium">{result.materialCost.toLocaleString()} ₽</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Стоимость работы:</span>
                          <span className="font-medium">{result.laborCost.toLocaleString()} ₽</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Итого:</span>
                          <span className="text-green-600">{result.totalCost.toLocaleString()} ₽</span>
                        </div>
                      </div>

                      {/* Дополнительные опции */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Дополнительные услуги:</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>Доставка:</span>
                            <span>{result.options.delivery.toLocaleString()} ₽</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span>Сборка:</span>
                            <span>{result.options.assembly.toLocaleString()} ₽</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span>Гарантия:</span>
                            <span>{result.options.warranty.toLocaleString()} ₽</span>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-bold">
                          <span>Итого с услугами:</span>
                          <span className="text-blue-600">{result.totalWithOptions.toLocaleString()} ₽</span>
                        </div>
                      </div>

                      {/* Дополнительная информация */}
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          💡 Дополнительная информация
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Цена включает базовую фурнитуру</li>
                          <li>• Срок изготовления: 7-14 дней</li>
                          <li>• Возможна доставка и сборка</li>
                          <li>• Гарантия: 2 года</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Введите параметры мебели для расчета стоимости</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="3d-viewer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye3d className="h-5 w-5" />
                  3D Модель мебели
                </CardTitle>
                <CardDescription>
                  Интерактивная 3D визуализация вашей мебели
                </CardDescription>
              </CardHeader>
              <CardContent>
                {canShow3D ? (
                  <Furniture3DViewer
                    width={parseFloat(dimensions.width)}
                    height={parseFloat(dimensions.height)}
                    depth={parseFloat(dimensions.depth)}
                    furnitureType={furnitureType}
                    material={material}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye3d className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Заполните все параметры для просмотра 3D модели</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Дополнительные материалы */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Популярные материалы</CardTitle>
            <CardDescription>
              Выберите из нашего ассортимента качественных материалов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(materials).slice(0, 8).map(([id, material]) => (
                <div key={id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <h4 className="font-medium">{material.name}</h4>
                  <p className="text-sm text-gray-500">{material.pricePerSqm} ₽/м²</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 