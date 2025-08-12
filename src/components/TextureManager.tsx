import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from '../hooks/use-toast';
import { Upload, Trash2, Eye, RefreshCw, Plus, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Texture {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadDate: string;
  category?: string;
  tags?: string[];
}

interface TextureManagerProps {
  isAdmin?: boolean;
  onSelectTexture?: (texture: Texture) => void;
  selectedTextureId?: string;
}

const TextureManager: React.FC<TextureManagerProps> = ({ 
  isAdmin = false, 
  onSelectTexture,
  selectedTextureId 
}) => {
  const [textures, setTextures] = useState<Texture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewTexture, setPreviewTexture] = useState<Texture | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  // Загрузка текстур
  const fetchTextures = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/textures');
      if (!response.ok) throw new Error('Не удалось загрузить текстуры');
      
      const data = await response.json();
      setTextures(data);
    } catch (error) {
      console.error('Ошибка при загрузке текстур:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить текстуры',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка текстур при монтировании компонента
  useEffect(() => {
    fetchTextures();
  }, []);

  // Обработчик выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Загрузка новой текстуры
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('texture', selectedFile);

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/textures', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Не удалось загрузить текстуру');
      
      toast({
        title: 'Успешно',
        description: 'Текстура успешно загружена'
      });
      
      // Обновляем список текстур
      fetchTextures();
      setSelectedFile(null);
      
      // Сбрасываем значение input file
      const fileInput = document.getElementById('texture-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Ошибка при загрузке текстуры:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить текстуру',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление текстуры
  const deleteTexture = async (textureId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/textures/${textureId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Не удалось удалить текстуру');
      
      toast({
        title: 'Успешно',
        description: 'Текстура успешно удалена'
      });
      
      // Обновляем список текстур
      fetchTextures();
    } catch (error) {
      console.error('Ошибка при удалении текстуры:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить текстуру',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Байт';
    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Фильтрация текстур
  const filteredTextures = textures.filter(texture => {
    const matchesSearch = texture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (texture.tags && texture.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = categoryFilter === 'all' || texture.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Обработчик выбора текстуры
  const handleSelectTexture = (texture: Texture) => {
    if (onSelectTexture) {
      onSelectTexture(texture);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Управление текстурами
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchTextures} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Просмотр</TabsTrigger>
              <TabsTrigger value="upload">Загрузка</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск текстур..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="wood">Дерево</SelectItem>
                    <SelectItem value="fabric">Ткань</SelectItem>
                    <SelectItem value="stone">Камень</SelectItem>
                    <SelectItem value="metal">Металл</SelectItem>
                    <SelectItem value="plastic">Пластик</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredTextures.map((texture) => (
                    <div 
                      key={texture.id} 
                      className={`relative group rounded-lg border overflow-hidden ${selectedTextureId === texture.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleSelectTexture(texture)}
                    >
                      <div className="aspect-square bg-muted">
                        <img 
                          src={texture.url} 
                          alt={texture.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 bg-card">
                        <div className="font-medium truncate text-sm">{texture.name}</div>
                        <div className="text-xs text-muted-foreground">{formatFileSize(texture.size)}</div>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTexture(texture);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить текстуру?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы уверены, что хотите удалить текстуру "{texture.name}"? Это действие нельзя отменить.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteTexture(texture.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredTextures.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                      {isLoading ? 'Загрузка текстур...' : 'Текстуры не найдены'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="texture-upload">Выберите файл текстуры</Label>
                  <Input
                    id="texture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="texture-category">Категория</Label>
                  <Select defaultValue="other">
                    <SelectTrigger id="texture-category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wood">Дерево</SelectItem>
                      <SelectItem value="fabric">Ткань</SelectItem>
                      <SelectItem value="stone">Камень</SelectItem>
                      <SelectItem value="metal">Металл</SelectItem>
                      <SelectItem value="plastic">Пластик</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Загрузка...' : 'Загрузить текстуру'}
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  <p>Поддерживаемые форматы: JPEG, PNG, GIF, WebP</p>
                  <p>Максимальный размер файла: 10 МБ</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Режим выбора текстуры для обычного пользователя
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск текстур..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="wood">Дерево</SelectItem>
                  <SelectItem value="fabric">Ткань</SelectItem>
                  <SelectItem value="stone">Камень</SelectItem>
                  <SelectItem value="metal">Металл</SelectItem>
                  <SelectItem value="plastic">Пластик</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredTextures.map((texture) => (
                  <div 
                    key={texture.id} 
                    className={`relative group rounded-lg border overflow-hidden cursor-pointer ${selectedTextureId === texture.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleSelectTexture(texture)}
                  >
                    <div className="aspect-square bg-muted">
                      <img 
                        src={texture.url} 
                        alt={texture.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 bg-card">
                      <div className="font-medium truncate text-sm">{texture.name}</div>
                      <div className="text-xs text-muted-foreground">{formatFileSize(texture.size)}</div>
                    </div>
                  </div>
                ))}
                
                {filteredTextures.length === 0 && (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    {isLoading ? 'Загрузка текстур...' : 'Текстуры не найдены'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
      
      {/* Диалог предпросмотра текстуры */}
      <Dialog open={!!previewTexture} onOpenChange={(open) => !open && setPreviewTexture(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewTexture?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewTexture && (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border max-h-[60vh]">
                  <img 
                    src={previewTexture.url} 
                    alt={previewTexture.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Имя файла:</span> {previewTexture.name}</p>
                    <p><span className="font-medium">Размер:</span> {formatFileSize(previewTexture.size)}</p>
                    <p><span className="font-medium">Тип:</span> {previewTexture.type}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Категория:</span> {previewTexture.category || 'Не указана'}</p>
                    <p><span className="font-medium">Дата загрузки:</span> {new Date(previewTexture.uploadDate).toLocaleDateString()}</p>
                    {previewTexture.tags && previewTexture.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="font-medium">Теги:</span>
                        {previewTexture.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TextureManager;