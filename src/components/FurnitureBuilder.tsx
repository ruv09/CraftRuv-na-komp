import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Eye,
  EyeOff,
  Layers,
  Grid3X3
} from 'lucide-react';

// Типы элементов мебели (как в Базис)
interface FurnitureElement {
  id: string;
  type: 'corpus' | 'shelf' | 'door' | 'drawer';
  name: string;
  dimensions: { width: number; height: number; depth: number };
  material: string;
  visible: boolean;
}

export default function FurnitureBuilder() {
  const [elements, setElements] = useState<FurnitureElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Создание корпуса
  const createCorpus = () => {
    const corpus: FurnitureElement = {
      id: `corpus-${Date.now()}`,
      type: 'corpus',
      name: 'Корпус',
      dimensions: { width: 800, height: 2000, depth: 600 },
      material: 'laminate_white',
      visible: true
    };
    setElements(prev => [...prev, corpus]);
  };

  // Создание полки
  const createShelf = () => {
    const shelf: FurnitureElement = {
      id: `shelf-${Date.now()}`,
      type: 'shelf',
      name: 'Полка',
      dimensions: { width: 780, height: 18, depth: 580 },
      material: 'laminate_white',
      visible: true
    };
    setElements(prev => [...prev, shelf]);
  };

  // Создание двери
  const createDoor = () => {
    const door: FurnitureElement = {
      id: `door-${Date.now()}`,
      type: 'door',
      name: 'Дверь',
      dimensions: { width: 400, height: 1900, depth: 18 },
      material: 'laminate_white',
      visible: true
    };
    setElements(prev => [...prev, door]);
  };

  // Удаление элемента
  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // Переключение видимости
  const toggleVisibility = (id: string) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, visible: !el.visible } : el
    ));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Левая панель - Инструменты */}
      <div className="w-80 border-r border-border bg-card p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Создание элементов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={createCorpus} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Создать корпус
            </Button>
            <Button onClick={createShelf} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Добавить полку
            </Button>
            <Button onClick={createDoor} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Добавить дверь
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Элементы ({elements.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {elements.map((element) => (
              <div 
                key={element.id}
                className={`flex items-center justify-between p-2 border rounded cursor-pointer ${
                  selectedElement === element.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedElement(element.id)}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${
                    element.type === 'corpus' ? 'bg-blue-500' :
                    element.type === 'shelf' ? 'bg-green-500' :
                    element.type === 'door' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-sm">{element.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(element.id);
                    }}
                  >
                    {element.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Центральная панель - 3D вид */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Конструктор мебели (Базис-стиль)</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{elements.length} элементов</Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🪑</div>
              <h3 className="text-xl font-semibold mb-2">3D Конструктор</h3>
              <p className="text-muted-foreground mb-4">
                Принципы построения мебели как в Базис
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <h4 className="font-semibold mb-2">Структурные элементы:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Корпус (основа)</li>
                    <li>• Полки (горизонтальные)</li>
                    <li>• Двери (подвижные)</li>
                    <li>• Ящики (выдвижные)</li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold mb-2">Параметры:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• X - ширина</li>
                    <li>• Y - высота</li>
                    <li>• Z - глубина</li>
                    <li>• Материалы</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Правая панель - Свойства */}
      <div className="w-80 border-l border-border bg-card p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Свойства элемента</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedElement ? (
              <>
                <div>
                  <Label className="text-xs">Название</Label>
                  <Input 
                    value={elements.find(el => el.id === selectedElement)?.name || ''}
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Размеры (мм)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input 
                      placeholder="Ш" 
                      value={elements.find(el => el.id === selectedElement)?.dimensions.width}
                      className="text-sm" 
                    />
                    <Input 
                      placeholder="В" 
                      value={elements.find(el => el.id === selectedElement)?.dimensions.height}
                      className="text-sm" 
                    />
                    <Input 
                      placeholder="Г" 
                      value={elements.find(el => el.id === selectedElement)?.dimensions.depth}
                      className="text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Материал</Label>
                  <Input 
                    value={elements.find(el => el.id === selectedElement)?.material || ''}
                    className="text-sm"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Выберите элемент для редактирования свойств
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 