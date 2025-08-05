import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
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
  Sparkles,
  Layers,
  Grid3X3,
  Ruler,
  Palette,
  Package,
  Wrench,
  Zap,
  History,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Move,
  Scale,
  Copy,
  Trash2,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  EyeOff,
  EyeOn,
  Lock,
  Unlock,
  Star,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react';

interface WorkspaceProps {
  children?: React.ReactNode;
  project?: any;
  onProjectChange?: (project: any) => void;
  onSave?: () => void;
  onExport?: (format: string) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ 
  children, 
  project, 
  onProjectChange, 
  onSave, 
  onExport 
}) => {
  const [activeTab, setActiveTab] = useState('design');
  const [selectedTool, setSelectedTool] = useState('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Инструменты для работы с объектами
  const tools = [
    { id: 'select', name: 'Выбор', icon: Eye, shortcut: 'V' },
    { id: 'move', name: 'Перемещение', icon: Move, shortcut: 'M' },
    { id: 'rotate', name: 'Поворот', icon: RotateCw, shortcut: 'R' },
    { id: 'scale', name: 'Масштаб', icon: Scale, shortcut: 'S' },
    { id: 'copy', name: 'Копирование', icon: Copy, shortcut: 'C' },
    { id: 'delete', name: 'Удаление', icon: Trash2, shortcut: 'Del' },
  ];

  // Виды отображения
  const viewModes = [
    { id: 'perspective', name: 'Перспектива', icon: Eye },
    { id: 'top', name: 'Сверху', icon: Grid3X3 },
    { id: 'front', name: 'Спереди', icon: Eye },
    { id: 'side', name: 'Сбоку', icon: Eye },
  ];

  // Панели свойств
  const propertyPanels = [
    { id: 'design', name: 'Дизайн', icon: Palette },
    { id: 'materials', name: 'Материалы', icon: Package },
    { id: 'hardware', name: 'Фурнитура', icon: Wrench },
    { id: 'physics', name: 'Физика', icon: Zap },
    { id: 'rendering', name: 'Рендеринг', icon: Eye },
  ];

  const handleToolChange = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev + 10 : prev - 10;
      return Math.max(10, Math.min(200, newZoom));
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Верхняя панель инструментов */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Логотип и название */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🪑</div>
              <span className="font-bold text-lg">CraftRuv</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">
              {project?.name || 'Новый проект'}
            </span>
          </div>

          {/* Основные действия */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
              <Redo className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="outline" size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport?.('json')}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>

        {/* Панель инструментов */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border">
          <div className="flex items-center space-x-1">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleToolChange(tool.id)}
                className="flex flex-col items-center p-2 h-auto"
              >
                <tool.icon className="h-4 w-4 mb-1" />
                <span className="text-xs">{tool.name}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAxes(!showAxes)}>
              <Ruler className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="ghost" size="sm" onClick={() => handleZoom('out')}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={() => handleZoom('in')}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Основное рабочее пространство */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Левая панель - Инструменты и библиотека */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full flex flex-col">
              {/* Вкладки левой панели */}
              <Tabs defaultValue="tools" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tools">Инструменты</TabsTrigger>
                  <TabsTrigger value="library">Библиотека</TabsTrigger>
                  <TabsTrigger value="history">История</TabsTrigger>
                </TabsList>

                <TabsContent value="tools" className="flex-1 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Примитивы</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" />
                            Куб
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" />
                            Цилиндр
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" />
                            Сфера
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Мебель</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Package className="h-4 w-4 mr-2" />
                            Шкаф
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Package className="h-4 w-4 mr-2" />
                            Стол
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Package className="h-4 w-4 mr-2" />
                            Стул
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Фурнитура</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Wrench className="h-4 w-4 mr-2" />
                            Петли
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Wrench className="h-4 w-4 mr-2" />
                            Ручки
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Wrench className="h-4 w-4 mr-2" />
                            Направляющие
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="library" className="flex-1 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Поиск элементов..." className="pl-8" />
                        </div>
                        <Button variant="ghost" size="sm">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </div>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Избранное</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between p-2 border rounded hover:bg-muted cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">Мой шкаф</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="history" className="flex-1 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-2">
                      {history.map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                            index === historyIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                          }`}
                        >
                          <History className="h-4 w-4" />
                          <span className="text-sm">{item.action}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Центральная панель - 3D вид */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full flex flex-col">
              {/* Панель видов */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div className="flex items-center space-x-1">
                  {viewModes.map((mode) => (
                    <Button key={mode.id} variant="ghost" size="sm">
                      <mode.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 3D область просмотра */}
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
                {children || (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🪑</div>
                      <h3 className="text-xl font-semibold mb-2">3D Рабочее пространство</h3>
                      <p className="text-muted-foreground">
                        Выберите инструмент и начните создавать мебель
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Правая панель - Свойства */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="design">Свойства</TabsTrigger>
                  <TabsTrigger value="materials">Материалы</TabsTrigger>
                </TabsList>

                <TabsContent value="design" className="flex-1 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Основные параметры</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs">Название</Label>
                            <Input 
                              value={project?.name || ''} 
                              onChange={(e) => onProjectChange?.({ ...project, name: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Описание</Label>
                            <Textarea 
                              value={project?.description || ''} 
                              onChange={(e) => onProjectChange?.({ ...project, description: e.target.value })}
                              className="text-sm"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Размеры</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Ширина</Label>
                              <Input 
                                type="number" 
                                value={project?.dimensions?.width || 0} 
                                onChange={(e) => onProjectChange?.({
                                  ...project, 
                                  dimensions: { ...project?.dimensions, width: Number(e.target.value) }
                                })}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Высота</Label>
                              <Input 
                                type="number" 
                                value={project?.dimensions?.height || 0} 
                                onChange={(e) => onProjectChange?.({
                                  ...project, 
                                  dimensions: { ...project?.dimensions, height: Number(e.target.value) }
                                })}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Глубина</Label>
                              <Input 
                                type="number" 
                                value={project?.dimensions?.depth || 0} 
                                onChange={(e) => onProjectChange?.({
                                  ...project, 
                                  dimensions: { ...project?.dimensions, depth: Number(e.target.value) }
                                })}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Позиция</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">X</Label>
                              <Input type="number" defaultValue="0" className="text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs">Y</Label>
                              <Input type="number" defaultValue="0" className="text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs">Z</Label>
                              <Input type="number" defaultValue="0" className="text-sm" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Поворот</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">X</Label>
                              <Input type="number" defaultValue="0" className="text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs">Y</Label>
                              <Input type="number" defaultValue="0" className="text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs">Z</Label>
                              <Input type="number" defaultValue="0" className="text-sm" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="materials" className="flex-1 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Материалы</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs">Основной материал</Label>
                            <Select value={project?.material || ''} onValueChange={(value) => onProjectChange?.({ ...project, material: value })}>
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="oak">Дуб</SelectItem>
                                <SelectItem value="pine">Сосна</SelectItem>
                                <SelectItem value="birch">Берёза</SelectItem>
                                <SelectItem value="laminate">ЛДСП</SelectItem>
                                <SelectItem value="mdf">МДФ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Цвет</Label>
                            <div className="flex space-x-2">
                              <div className="w-6 h-6 bg-amber-800 rounded border cursor-pointer"></div>
                              <div className="w-6 h-6 bg-amber-600 rounded border cursor-pointer"></div>
                              <div className="w-6 h-6 bg-amber-400 rounded border cursor-pointer"></div>
                              <div className="w-6 h-6 bg-white rounded border cursor-pointer"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Текстуры</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="aspect-square bg-gradient-to-br from-amber-200 to-amber-400 rounded border cursor-pointer"></div>
                            <div className="aspect-square bg-gradient-to-br from-amber-300 to-amber-500 rounded border cursor-pointer"></div>
                            <div className="aspect-square bg-gradient-to-br from-amber-400 to-amber-600 rounded border cursor-pointer"></div>
                            <div className="aspect-square bg-gradient-to-br from-amber-500 to-amber-700 rounded border cursor-pointer"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Нижняя панель - Статус и информация */}
      <div className="border-t border-border bg-card px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">
              Инструмент: {tools.find(t => t.id === selectedTool)?.name}
            </span>
            <span className="text-muted-foreground">
              Масштаб: {zoom}%
            </span>
            <span className="text-muted-foreground">
              Объектов: 0
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">
              Координаты: X: 0, Y: 0, Z: 0
            </span>
            <Button variant="ghost" size="sm">
              <Calculator className="h-4 w-4 mr-2" />
              Расчет стоимости
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace; 