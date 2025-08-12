import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  RotateCcw, 
  Move, 
  Ruler, 
  Settings,
  Grid3X3,
  Layers,
  Package,
  FileText,
  Download,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Square,
  Circle,
  Triangle,
  Box,
  DoorOpen,
  Package as Drawer,
  Archive as Cabinet,
  Table,
  Car as Chair
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FurnitureElement {
  id: string;
  type: 'corpus' | 'shelf' | 'door' | 'drawer' | 'table' | 'chair' | 'bed' | 'sofa' | 'wall' | 'floor' | 'appliance' | 'annotation';
  name: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  material: string;
  visible: boolean;
  locked: boolean;
  color: string;
  parentId?: string;
  children?: string[];
  groupId?: string;
  // Дополнительные свойства как в Базис
  direction?: 'vertical' | 'horizontal' | 'diagonal';
  linear?: boolean;
  thickness?: number;
  // Облицовка кромки
  edgeBanding?: {
    thickness: number;
    trim: boolean;
    allowance: number;
    tape: string;
    overlap: number;
  };
}

interface FurnitureGroup {
  id: string;
  name: string;
  type: 'kitchen' | 'wardrobe' | 'living' | 'office' | 'custom';
  elements: string[];
  expanded: boolean;
}

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  action: () => void;
}

export default function FurnitureBuilder() {
  const [elements, setElements] = useState<FurnitureElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'top' | 'front' | 'side'>('3d');
  const [multiView, setMultiView] = useState(false);
  const [activeView, setActiveView] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-left');
  const [zoom, setZoom] = useState(1);
  const [gridSize, setGridSize] = useState(10);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<FurnitureElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [groups, setGroups] = useState<FurnitureGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [rightPanelTab, setRightPanelTab] = useState<'files' | 'history'>('files');

  // Группировка элементов по типу для дерева структуры
  const elementsByType = useMemo(() => {
    const map: Record<string, FurnitureElement[]> = {};
    for (const el of elements) {
      if (!map[el.type]) map[el.type] = [];
      map[el.type].push(el);
    }
    return map;
  }, [elements]);

  // Инструменты
  const tools: Tool[] = [
    {
      id: 'select',
      name: 'Выбор',
      icon: Move,
      description: 'Выбор и перемещение элементов',
      action: () => setActiveTool('select')
    },
    {
      id: 'corpus',
      name: 'Корпус',
      icon: Cabinet,
      description: 'Создать корпус мебели',
      action: () => createElement('corpus')
    },
    {
      id: 'shelf',
      name: 'Полка',
      icon: Layers,
      description: 'Добавить полку',
      action: () => createElement('shelf')
    },
    {
      id: 'door',
      name: 'Дверь',
      icon: DoorOpen,
      description: 'Добавить дверь',
      action: () => createElement('door')
    },
    {
      id: 'drawer',
      name: 'Ящик',
      icon: Drawer,
      description: 'Добавить выдвижной ящик',
      action: () => createElement('drawer')
    },
    {
      id: 'table',
      name: 'Стол',
      icon: Table,
      description: 'Создать стол',
      action: () => createElement('table')
    },
    {
      id: 'chair',
      name: 'Стул',
      icon: Chair,
      description: 'Создать стул',
      action: () => createElement('chair')
    }
  ];

  // Материалы
  const materials = [
    { name: 'ДСП', color: '#8B4513', price: 1500 },
    { name: 'МДФ', color: '#DEB887', price: 2000 },
    { name: 'Массив дерева', color: '#A0522D', price: 5000 },
    { name: 'Шпон', color: '#CD853F', price: 3000 },
    { name: 'Ламинированная плита', color: '#F5DEB3', price: 1800 }
  ];

  // Стандартные пресеты шкафов
  const standardCabinets = [
    {
      name: 'Шкаф-купе 2-дверный',
      type: 'wardrobe',
      params: { width: 200, height: 240, depth: 60, doors: 2, shelves: 4, drawers: 2 },
      description: 'Стандартный шкаф-купе с зеркалом'
    },
    {
      name: 'Кухонный гарнитур 3 секции',
      type: 'kitchen',
      params: { width: 300, height: 85, depth: 60, cabinets: 3, drawers: 2 },
      description: 'Нижние шкафы кухни со столешницей'
    },
    {
      name: 'Книжный шкаф 5 полок',
      type: 'living',
      params: { width: 120, height: 200, depth: 30, shelves: 5 },
      description: 'Классический книжный шкаф'
    },
    {
      name: 'Тумба прикроватная',
      type: 'bedroom',
      params: { width: 50, height: 60, depth: 40, drawers: 1 },
      description: 'Компактная тумба с ящиком'
    }
  ];

  // Каталог кухонных модулей (пресеты)
  const kitchenModules: { id: string; name: string; description: string; params: any }[] = [
    { id: 'base-door-600', name: 'Тумба дверь 600', description: 'Нижний шкаф с 1 дверью', params: { w: 600, h: 850, d: 600, doors: 1, shelves: 1 } },
    { id: 'base-drawers-600', name: 'Тумба ящики 600', description: 'Нижний шкаф с 3 ящиками', params: { w: 600, h: 850, d: 600, drawers: 3 } },
    { id: 'corner-base', name: 'Угловая тумба', description: 'Нижний угловой модуль', params: { w: 900, h: 850, d: 900, doors: 1 } },
    { id: 'wall-cabinet-900', name: 'Навесной 900', description: 'Верхний шкаф 2 двери', params: { w: 900, h: 720, d: 320, doors: 2, shelves: 1 } },
    { id: 'tall-pantry-600', name: 'Пенал 600', description: 'Высокий шкаф', params: { w: 600, h: 2100, d: 600, doors: 2, shelves: 4 } },
    { id: 'fridge-column', name: 'Пенал под холодильник', description: 'Колонна с нишей', params: { w: 600, h: 2100, d: 650, nicheH: 1900 } },
    { id: 'sink-base-600', name: 'Тумба под мойку 600', description: 'Нижний шкаф для мойки', params: { w: 600, h: 850, d: 600, doors: 2, sink: true } },
    { id: 'oven-base-600', name: 'Тумба под духовой 600', description: 'Нижний шкаф под духовой', params: { w: 600, h: 850, d: 600, oven: true } },
  ];

  const createElement = (type: FurnitureElement['type'], preset?: any) => {
    const newElement: FurnitureElement = {
      id: `${type}_${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${elements.filter(e => e.type === type).length + 1}`,
      position: { x: 0, y: 0, z: 0 },
      dimensions: preset?.dimensions || { width: 600, height: 400, depth: 400 },
      material: 'ДСП',
      visible: true,
      locked: false,
      color: '#8B4513',
      parentId: selectedGroup || undefined,
      direction: 'vertical',
      linear: false,
      thickness: 16.5,
      edgeBanding: {
        thickness: 0.5,
        trim: true,
        allowance: 0,
        tape: '',
        overlap: 15
      }
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    addToHistory(newElements);
  };

  const createStandardCabinet = (preset: any) => {
    const groupId = `group_${Date.now()}`;
    const newGroup: FurnitureGroup = {
      id: groupId,
      name: preset.name,
      type: preset.type,
      elements: [],
      expanded: true
    };
    
    setGroups(prev => [...prev, newGroup]);
    setSelectedGroup(groupId);
    
    // Создаем элементы согласно пресету
    const newElements: FurnitureElement[] = [];
    
    if (preset.type === 'wardrobe') {
      // Корпус
      newElements.push({
        id: `corpus_${Date.now()}`,
        type: 'corpus',
        name: 'Корпус шкафа',
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width: preset.params.width, height: preset.params.height, depth: preset.params.depth },
        material: 'ДСП',
        visible: true,
        locked: false,
        color: '#8B4513',
        groupId
      });
      
      // Полки
      for (let i = 0; i < preset.params.shelves; i++) {
        newElements.push({
          id: `shelf_${Date.now()}_${i}`,
          type: 'shelf',
          name: `Полка ${i + 1}`,
          position: { x: 0, y: (preset.params.height / (preset.params.shelves + 1)) * (i + 1), z: 0 },
          dimensions: { width: preset.params.width - 20, height: 20, depth: preset.params.depth - 20 },
          material: 'ДСП',
          visible: true,
          locked: false,
          color: '#DEB887',
          groupId
        });
      }
      
      // Двери
      for (let i = 0; i < preset.params.doors; i++) {
        newElements.push({
          id: `door_${Date.now()}_${i}`,
          type: 'door',
          name: `Дверь ${i + 1}`,
          position: { x: (preset.params.width / preset.params.doors) * i, y: 0, z: 0 },
          dimensions: { width: preset.params.width / preset.params.doors, height: preset.params.height, depth: 20 },
          material: 'ДСП',
          visible: true,
          locked: false,
          color: '#F5DEB3',
          groupId
        });
      }
    }
    
    setElements(prev => [...prev, ...newElements]);
    addToHistory([...elements, ...newElements]);
  };

  // Создание кухни: отдельный модуль как группа с корпусом, полками/ящиками, дверьми и техникой
  const createKitchenModule = (module: { id: string; name: string; params: any; description?: string }) => {
    const groupId = `kitchen_${module.id}_${Date.now()}`;
    const newGroup: FurnitureGroup = {
      id: groupId,
      name: module.name,
      type: 'kitchen',
      elements: [],
      expanded: true,
    };
    setGroups(prev => [...prev, newGroup]);

    const p = module.params;
    const parts: FurnitureElement[] = [];

    // Корпус
    parts.push({
      id: `corpus_${groupId}`,
      type: 'corpus',
      name: 'Корпус',
      position: { x: 0, y: 0, z: 0 },
      dimensions: { width: p.w, height: p.h, depth: p.d },
      material: 'ДСП',
      visible: true,
      locked: false,
      color: '#8B4513',
      groupId,
    });

    // Полки
    if (p.shelves) {
      for (let i = 0; i < p.shelves; i++) {
        parts.push({
          id: `shelf_${groupId}_${i}`,
          type: 'shelf',
          name: `Полка ${i + 1}`,
          position: { x: 0, y: (p.h / (p.shelves + 1)) * (i + 1), z: 0 },
          dimensions: { width: p.w - 20, height: 18, depth: p.d - 20 },
          material: 'ДСП',
          visible: true,
          locked: false,
          color: '#DEB887',
          groupId,
        });
      }
    }

    // Двери
    if (p.doors) {
      for (let i = 0; i < p.doors; i++) {
        parts.push({
          id: `door_${groupId}_${i}`,
          type: 'door',
          name: `Фасад ${i + 1}`,
          position: { x: (p.w / p.doors) * i, y: 0, z: 0 },
          dimensions: { width: p.w / p.doors, height: p.h, depth: 20 },
          material: 'МДФ',
          visible: true,
          locked: false,
          color: '#9aa6b2',
          groupId,
        });
      }
    }

    // Ящики
    if (p.drawers) {
      for (let i = 0; i < p.drawers; i++) {
        parts.push({
          id: `drawer_${groupId}_${i}`,
          type: 'drawer',
          name: `Ящик ${i + 1}`,
          position: { x: 0, y: (p.h / p.drawers) * i, z: 0 },
          dimensions: { width: p.w, height: p.h / p.drawers, depth: p.d },
          material: 'ДСП',
          visible: true,
          locked: false,
          color: '#cbb69b',
          groupId,
        });
      }
    }

    // Техника: мойка/духовой/ниша под холодильник
    if (p.sink) {
      parts.push({
        id: `appliance_${groupId}_sink`,
        type: 'appliance',
        name: 'Мойка',
        position: { x: p.w / 2 - 200, y: p.h - 40, z: p.d / 2 - 200 },
        dimensions: { width: 400, height: 40, depth: 400 },
        material: 'Сталь',
        visible: true,
        locked: false,
        color: '#666666',
        groupId,
      });
    }
    if (p.oven) {
      parts.push({
        id: `appliance_${groupId}_oven`,
        type: 'appliance',
        name: 'Духовой шкаф',
        position: { x: 0, y: p.h / 2 - 300, z: 0 },
        dimensions: { width: 600, height: 600, depth: 560 },
        material: 'Металл',
        visible: true,
        locked: false,
        color: '#222222',
        groupId,
      });
    }
    if (p.nicheH) {
      parts.push({
        id: `appliance_${groupId}_fridge_niche`,
        type: 'appliance',
        name: 'Ниша под холодильник',
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width: p.w, height: p.nicheH, depth: p.d - 50 },
        material: 'Пустота',
        visible: true,
        locked: true,
        color: '#e5e7eb',
        groupId,
      });
    }

    setElements(prev => [...prev, ...parts]);
    addToHistory([...elements, ...parts]);
  };

  // Комната: 2 стены и пол для базовой сцены
  const createRoom = (width: number, depth: number, height: number) => {
    const groupId = `room_${Date.now()}`;
    setGroups(prev => [...prev, { id: groupId, name: 'Комната', type: 'custom', elements: [], expanded: true }]);
    const roomParts: FurnitureElement[] = [
      { id: `floor_${groupId}`, type: 'floor', name: 'Пол', position: { x: 0, y: 0, z: 0 }, dimensions: { width, height: 10, depth: depth }, material: 'Ламинат', visible: true, locked: true, color: '#c2a58a', groupId },
      { id: `wallA_${groupId}`, type: 'wall', name: 'Стена A', position: { x: 0, y: 0, z: 0 }, dimensions: { width, height, depth: 10 }, material: 'Штукатурка', visible: true, locked: true, color: '#d1d5db', groupId },
      { id: `wallB_${groupId}`, type: 'wall', name: 'Стена B', position: { x: 0, y: 0, z: 0 }, dimensions: { width: 10, height, depth: depth }, material: 'Штукатурка', visible: true, locked: true, color: '#d1d5db', groupId },
    ];
    setElements(prev => [...prev, ...roomParts]);
    addToHistory([...elements, ...roomParts]);
  };

  // Автогенерация аннотаций-«размеров» как элементы типа annotation
  const generateAutoAnnotations = () => {
    const anns: FurnitureElement[] = elements
      .filter(el => ['corpus', 'shelf', 'door', 'drawer'].includes(el.type))
      .map((el) => ({
        id: `ann_${el.id}`,
        type: 'annotation',
        name: `${el.name}: ${Math.round(el.dimensions.width)}×${Math.round(el.dimensions.height)}×${Math.round(el.dimensions.depth)} мм`,
        position: { x: el.position.x, y: el.position.y + el.dimensions.height + 10, z: el.position.z },
        dimensions: { width: 0, height: 0, depth: 0 },
        material: 'text',
        visible: showDimensions,
        locked: true,
        color: '#111827',
        groupId: el.groupId,
      }));
    setElements(prev => [...prev.filter(e => e.type !== 'annotation'), ...anns]);
    addToHistory([...elements.filter(e => e.type !== 'annotation'), ...anns]);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    addToHistory(newElements);
  };

  const toggleVisibility = (id: string) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, visible: !el.visible } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  const updateElement = (id: string, updates: Partial<FurnitureElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  const addToHistory = (newElements: FurnitureElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="flex h-screen bg-background">


      {/* Центральная панель - 3D вид */}
      <div className="flex-1 flex flex-col">
        {/* Верхняя панель инструментов - как в Базис */}
        <div className="border-b border-border bg-card">
          {/* Меню как в Базис */}
          <div className="flex items-center px-4 py-1 text-sm border-b border-border">
            <span className="font-medium mr-4">Файл</span>
            <span className="font-medium mr-4">Буфер</span>
            <span className="font-medium mr-4">Блок</span>
            <span className="font-medium mr-4">Выделить</span>
            <span className="font-medium mr-4">Удалить</span>
            <span className="font-medium mr-4">Разрушить</span>
            <span className="font-medium mr-4">Настройка</span>
            <span className="font-medium mr-4">Изделие</span>
            <span className="font-medium mr-4">Сборки</span>
            <span className="font-medium mr-4">Окно</span>
            <span className="font-medium">Справка</span>
          </div>

          {/* Панели инструментов */}
          <div className="flex items-center justify-between px-4 py-2">
            {/* Первая строка - основные действия */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Save className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Вторая строка - настройки и виды */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs">М</span>
                <Input value="0.25" className="w-16 h-6 text-xs" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">Ш</span>
                <Input value="32" className="w-12 h-6 text-xs" />
              </div>
              <Select value="view1">
                <SelectTrigger className="w-20 h-6 text-xs">
                  <SelectValue>Вид 1</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view1">Вид 1</SelectItem>
                  <SelectItem value="view2">Вид 2</SelectItem>
                  <SelectItem value="view3">Вид 3</SelectItem>
                  <SelectItem value="view4">Вид 4</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm">
                <Layers className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Третья строка - категории инструментов */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-xs">Строить</Button>
              <Button variant="ghost" size="sm" className="text-xs">Править</Button>
              <Button variant="ghost" size="sm" className="text-xs">Размеры</Button>
              <Button variant="ghost" size="sm" className="text-xs">Операции</Button>
              <Button variant="ghost" size="sm" className="text-xs">Оформить</Button>
              <Button variant="ghost" size="sm" className="text-xs">Сервис</Button>
            </div>
          </div>
        </div>

        {/* Множественные виды как в Базис */}
        <div className="flex-1 bg-muted/20 relative overflow-hidden">
          {multiView ? (
            /* 4 панели 2x2 */
            <div className="grid grid-cols-2 grid-rows-2 h-full">
              {/* Верхний левый - Схема сборки */}
              <div className="border border-border bg-background relative">
                <div className="absolute top-0 left-0 right-0 bg-muted px-2 py-1 text-xs font-medium border-b">
                  Схема сборки
                </div>
                <div className="pt-6 p-2">
                  <div className="text-center text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Взрывная схема</p>
                  </div>
                </div>
              </div>

              {/* Верхний правый - 3D вид */}
              <div className="border border-border bg-background relative">
                <div className="absolute top-0 left-0 right-0 bg-muted px-2 py-1 text-xs font-medium border-b">
                  3D Вид
                </div>
                <div className="pt-6 p-2">
                  <div className="text-center text-muted-foreground">
                    <Box className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">3D модель</p>
                    {showDimensions && (
                      <div className="mt-2 space-y-1 text-[10px]">
                        {elements.filter(e => e.type === 'annotation' && e.visible).slice(0,5).map(a => (
                          <div key={a.id} className="text-muted-foreground">{a.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Нижний левый - Вид слева */}
              <div className="border border-border bg-background relative">
                <div className="absolute top-0 left-0 right-0 bg-muted px-2 py-1 text-xs font-medium border-b">
                  Вид слева
                </div>
                <div className="pt-6 p-2">
                  <div className="text-center text-muted-foreground">
                    <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Проекция слева</p>
                  </div>
                </div>
              </div>

              {/* Нижний правый - Вид справа */}
              <div className="border border-border bg-background relative">
                <div className="absolute top-0 left-0 right-0 bg-muted px-2 py-1 text-xs font-medium border-b">
                  Вид справа
                </div>
                <div className="pt-6 p-2">
                  <div className="text-center text-muted-foreground">
                    <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Проекция справа</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Одиночный вид */
            <div className="h-full relative">
              {showGrid && (
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`
                  }}
                />
              )}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Box className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">3D Вид</p>
                  <p className="text-sm">Выберите инструмент и создайте элементы мебели</p>
                  <p className="text-xs mt-2">
                    Вид: {viewMode.toUpperCase()} | Масштаб: {Math.round(zoom * 100)}% | 
                    Элементов: {elements.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Кнопка переключения видов */}
          <div className="absolute top-2 right-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMultiView(!multiView)}
              className="text-xs"
            >
              {multiView ? '1 Вид' : '4 Вида'}
            </Button>
          </div>
        </div>
      </div>

      {/* Левая панель - Свойства и Структура */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <Tabs defaultValue="properties" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Свойства</TabsTrigger>
            <TabsTrigger value="structure">Структура</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="flex-1 p-4">
            {selectedElementData ? (
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">
                  1 объектов
                </div>
                
                {/* Основные параметры */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-muted-foreground">Направление:</span>
                    <span>{selectedElementData.direction === 'vertical' ? 'По вертикали' : 'По горизонтали'}</span>
                    <span className="text-muted-foreground">Погонный:</span>
                    <span>{selectedElementData.linear ? 'Да' : 'Нет'}</span>
                    <span className="text-muted-foreground">Длина:</span>
                    <span>{selectedElementData.dimensions.width}</span>
                    <span className="text-muted-foreground">Ширина:</span>
                    <span>{selectedElementData.dimensions.depth}</span>
                    <span className="text-muted-foreground">Толщина:</span>
                    <span>{selectedElementData.thickness || 16.5}</span>
                    <span className="text-muted-foreground">Положение:</span>
                    <span>{selectedElementData.position.x.toFixed(1)},{selectedElementData.position.y.toFixed(1)},{selectedElementData.position.z.toFixed(1)}</span>
                    <span className="text-muted-foreground">Габариты:</span>
                    <span>{selectedElementData.thickness || 16.5} x {selectedElementData.dimensions.width} x {selectedElementData.dimensions.depth}</span>
                    <span className="text-muted-foreground">Тип:</span>
                    <span>Не задан</span>
                  </div>
                </div>

                {/* Облицовка кромки */}
                <div className="border border-red-300 bg-red-50 p-3 rounded">
                  <div className="text-sm font-medium mb-2">Облицовка кромки</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-muted-foreground">1 типов</span>
                    <span>4 шт</span>
                    <span className="text-muted-foreground">Толщина:</span>
                    <Input 
                      value={selectedElementData.edgeBanding?.thickness || 0.5} 
                      onChange={(e) => updateElement(selectedElementData.id, {
                        edgeBanding: { ...selectedElementData.edgeBanding, thickness: Number(e.target.value) }
                      })}
                      className="h-6 text-xs"
                    />
                    <span className="text-muted-foreground">Подрезать:</span>
                    <input 
                      type="checkbox" 
                      checked={selectedElementData.edgeBanding?.trim || false}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        edgeBanding: { ...selectedElementData.edgeBanding, trim: e.target.checked }
                      })}
                    />
                    <span className="text-muted-foreground">Припуск:</span>
                    <Input 
                      value={selectedElementData.edgeBanding?.allowance || 0} 
                      onChange={(e) => updateElement(selectedElementData.id, {
                        edgeBanding: { ...selectedElementData.edgeBanding, allowance: Number(e.target.value) }
                      })}
                      className="h-6 text-xs bg-yellow-100"
                    />
                    <span className="text-muted-foreground">Лента:</span>
                    <Input 
                      value={selectedElementData.edgeBanding?.tape || ''} 
                      onChange={(e) => updateElement(selectedElementData.id, {
                        edgeBanding: { ...selectedElementData.edgeBanding, tape: e.target.value }
                      })}
                      className="h-6 text-xs"
                    />
                    <span className="text-muted-foreground">Свес:</span>
                    <Input 
                      value={selectedElementData.edgeBanding?.overlap || 15} 
                      onChange={(e) => updateElement(selectedElementData.id, {
                        edgeBanding: { ...selectedElementData.edgeBanding, overlap: Number(e.target.value) }
                      })}
                      className="h-6 text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Выберите элемент для редактирования свойств</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="structure" className="flex-1 p-2">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {/* Группы */}
                {groups.map((group) => (
                  <div key={group.id} className="border rounded-md">
                    <div 
                      className="px-2 py-1 text-xs font-medium bg-muted flex items-center justify-between cursor-pointer"
                      onClick={() => setGroups(prev => prev.map(g => g.id === group.id ? { ...g, expanded: !g.expanded } : g))}
                    >
                      <span className="capitalize">{group.name}</span>
                      <span className="text-[10px] text-muted-foreground">({elements.filter(e => e.groupId === group.id).length})</span>
                    </div>
                    {group.expanded && (
                      <div className="p-1 space-y-1">
                        {elements.filter(e => e.groupId === group.id).map((el) => (
                          <div
                            key={el.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer ${
                              selectedElement === el.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                            }`}
                            onClick={() => setSelectedElement(el.id)}
                          >
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: el.color }} />
                            <span className="flex-1 truncate">{el.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {el.dimensions.width}×{el.dimensions.height}×{el.dimensions.depth}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Отдельные элементы */}
                {Object.keys(elementsByType).length === 0 && groups.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2">
                    Элементы не созданы. Откройте вкладку "Библиотека" справа и добавьте элементы.
                  </div>
                )}
                {Object.entries(elementsByType).map(([type, list]) => {
                  const ungroupedElements = list.filter(el => !el.groupId);
                  if (ungroupedElements.length === 0) return null;
                  
                  return (
                    <div key={type} className="border rounded-md">
                      <div className="px-2 py-1 text-xs font-medium bg-muted capitalize">{type}</div>
                      <div className="p-1 space-y-1">
                        {ungroupedElements.map((el) => (
                          <div
                            key={el.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer ${
                              selectedElement === el.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                            }`}
                            onClick={() => setSelectedElement(el.id)}
                          >
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: el.color }} />
                            <span className="flex-1 truncate">{el.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {el.dimensions.width}×{el.dimensions.height}×{el.dimensions.depth}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

          <TabsContent value="library" className="p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Каталог кухни</h4>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => createRoom(4000, 3000, 2700)}>Комната</Button>
                    <Button size="sm" variant="outline" onClick={generateAutoAnnotations}>{showDimensions ? 'Обновить размеры' : 'Показать размеры'}</Button>
                    <input type="checkbox" className="ml-1" checked={showDimensions} onChange={(e)=>{setShowDimensions(e.target.checked); generateAutoAnnotations();}} />
                  </div>
                </div>

                {/* Кухонные модули */}
                <div className="grid grid-cols-1 gap-2">
                  {kitchenModules.map(m => (
                    <div key={m.id} className="p-3 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => createKitchenModule(m)}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{m.name}</span>
                        <Badge variant="outline" className="text-xs">kitchen</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                    </div>
                  ))}
                </div>

                <h4 className="text-sm font-medium">Стандартные шкафы</h4>
                <div className="space-y-2">
                  {standardCabinets.map((cabinet) => (
                    <div
                      key={cabinet.name}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => createStandardCabinet(cabinet)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{cabinet.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {cabinet.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{cabinet.description}</p>
                      <div className="text-xs text-muted-foreground">
                        {cabinet.params.width}×{cabinet.params.height}×{cabinet.params.depth} мм
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <h4 className="text-sm font-medium">Модули</h4>
                <div className="grid grid-cols-2 gap-2">
                  {tools.filter(t => ['corpus','shelf','door','drawer','table','chair'].includes(t.id)).map((tool) => (
                    <Button
                      key={tool.id}
                      variant="outline"
                      size="sm"
                      className="h-20 flex flex-col items-center justify-center gap-2"
                      onClick={tool.action}
                    >
                      <tool.icon className="h-6 w-6" />
                      <span className="text-xs">{tool.name}</span>
                    </Button>
                  ))}
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Материалы</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {materials.map((material) => (
                      <div
                        key={material.name}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent"
                        onClick={() => {
                          if (selectedElementData) {
                            updateElement(selectedElementData.id, { 
                              material: material.name,
                              color: material.color 
                            });
                          }
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: material.color }}
                        />
                        <span className="text-sm">{material.name}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {material.price} ₽/м²
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="properties" className="p-4">
            {selectedElementData ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Название</Label>
                  <Input
                    value={selectedElementData.name}
                    onChange={(e) => updateElement(selectedElementData.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Размеры (мм)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Ширина</Label>
                      <Input
                        type="number"
                        value={selectedElementData.dimensions.width}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          dimensions: { ...selectedElementData.dimensions, width: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Высота</Label>
                      <Input
                        type="number"
                        value={selectedElementData.dimensions.height}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          dimensions: { ...selectedElementData.dimensions, height: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Глубина</Label>
                      <Input
                        type="number"
                        value={selectedElementData.dimensions.depth}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          dimensions: { ...selectedElementData.dimensions, depth: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Позиция (мм)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">X</Label>
                      <Input
                        type="number"
                        value={selectedElementData.position.x}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          position: { ...selectedElementData.position, x: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Y</Label>
                      <Input
                        type="number"
                        value={selectedElementData.position.y}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          position: { ...selectedElementData.position, y: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Z</Label>
                      <Input
                        type="number"
                        value={selectedElementData.position.z}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          position: { ...selectedElementData.position, z: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Материал</Label>
                  <select
                    value={selectedElementData.material}
                    onChange={(e) => {
                      const material = materials.find(m => m.name === e.target.value);
                      updateElement(selectedElementData.id, { 
                        material: e.target.value,
                        color: material?.color || selectedElementData.color
                      });
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    {materials.map((material) => (
                      <option key={material.name} value={material.name}>
                        {material.name} - {material.price} ₽/м²
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedElementData.visible}
                    onChange={(e) => updateElement(selectedElementData.id, { visible: e.target.checked })}
                  />
                  <Label className="text-sm">Видимый</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedElementData.locked}
                    onChange={(e) => updateElement(selectedElementData.id, { locked: e.target.checked })}
                  />
                  <Label className="text-sm">Заблокирован</Label>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Выберите элемент для редактирования свойств</p>
              </div>
            )}
          </TabsContent>

          {/* Материалы теперь в библиотеке */}
        </Tabs>
      </div>
      
      {/* Нижний статус-бар */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/90 backdrop-blur px-3 py-1 text-xs flex items-center gap-4">
        <span>Элементов: {elements.length}</span>
        <span>Групп: {groups.length}</span>
        <span>Вид: {viewMode.toUpperCase()}</span>
        <span>Масштаб: {Math.round(zoom * 100)}%</span>
        <span>Сетка: {gridSize} мм {snapToGrid ? '(привязка)' : ''}</span>
        {selectedElementData && (
          <span className="ml-auto">
            Выбрано: {selectedElementData.name} — {selectedElementData.dimensions.width}×{selectedElementData.dimensions.height}×{selectedElementData.dimensions.depth} мм — {selectedElementData.material}
          </span>
        )}
      </div>
    </div>
  );
} 