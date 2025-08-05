import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  Package, 
  Image, 
  FolderOpen, 
  Upload, 
  Trash2, 
  Edit, 
  Plus,
  Search,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalFurniture: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

interface Texture {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface Furniture {
  _id: string;
  name: string;
  category: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  price: number;
  description: string;
  textures: string[];
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const AdminPanel: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [textures, setTextures] = useState<Texture[]>([]);
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Доступ запрещен. Требуются права администратора.');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Load dashboard data
  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users?search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTextures = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/textures`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTextures(data.data.textures);
      }
    } catch (error) {
      console.error('Error loading textures:', error);
      toast.error('Ошибка загрузки текстур');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFurniture = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/furniture`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFurniture(data.data.furniture);
      }
    } catch (error) {
      console.error('Error loading furniture:', error);
      toast.error('Ошибка загрузки мебели');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Ошибка загрузки проектов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case 'users':
        loadUsers();
        break;
      case 'textures':
        loadTextures();
        break;
      case 'furniture':
        loadFurniture();
        break;
      case 'projects':
        loadProjects();
        break;
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Выберите файл для загрузки');
      return;
    }

    const formData = new FormData();
    formData.append('texture', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/textures`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Текстура загружена успешно');
        setSelectedFile(null);
        loadTextures();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Ошибка загрузки текстуры');
      }
    } catch (error) {
      console.error('Error uploading texture:', error);
      toast.error('Ошибка загрузки текстуры');
    }
  };

  const deleteTexture = async (textureId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту текстуру?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/textures/${textureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Текстура удалена успешно');
        loadTextures();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Ошибка удаления текстуры');
      }
    } catch (error) {
      console.error('Error deleting texture:', error);
      toast.error('Ошибка удаления текстуры');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Пользователь удален успешно');
        loadUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Ошибка удаления пользователя');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Ошибка удаления пользователя');
    }
  };

  const deleteFurniture = async (furnitureId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот предмет мебели?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/furniture/${furnitureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Мебель удалена успешно');
        loadFurniture();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Ошибка удаления мебели');
      }
    } catch (error) {
      console.error('Error deleting furniture:', error);
      toast.error('Ошибка удаления мебели');
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Проект удален успешно');
        loadProjects();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Ошибка удаления проекта');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Ошибка удаления проекта');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
              <p>Требуются права администратора</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Панель администратора</h1>
          <p className="text-blue-200">Управление системой CraftRuv</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <FolderOpen className="w-4 h-4 mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <Users className="w-4 h-4 mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="textures" className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <Image className="w-4 h-4 mr-2" />
              Текстуры
            </TabsTrigger>
            <TabsTrigger value="furniture" className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <Package className="w-4 h-4 mr-2" />
              Мебель
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-900">
              <FolderOpen className="w-4 h-4 mr-2" />
              Проекты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Пользователи
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</div>
                    <p className="text-blue-200">Всего зарегистрировано</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Мебель
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{stats?.totalFurniture || 0}</div>
                    <p className="text-blue-200">Предметов в каталоге</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FolderOpen className="w-5 h-5 mr-2" />
                      Проекты
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{stats?.totalProjects || 0}</div>
                    <p className="text-blue-200">Создано пользователями</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Управление пользователями</CardTitle>
                <CardDescription className="text-blue-200">
                  Просмотр и управление пользователями системы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-4 h-4" />
                    <Input
                      placeholder="Поиск пользователей..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                    />
                  </div>
                  <Button onClick={loadUsers} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">{user.name}</h3>
                        <p className="text-blue-200 text-sm">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'premium' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteUser(user._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="textures" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Управление текстурами</CardTitle>
                <CardDescription className="text-blue-200">
                  Загрузка и управление текстурами для мебели
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 border border-white/20 rounded-lg">
                  <h3 className="text-white font-medium mb-4">Загрузить новую текстуру</h3>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="texture" className="text-white">Выберите файл</Label>
                      <Input
                        id="texture"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Button onClick={handleFileUpload} disabled={!selectedFile || isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Загрузить
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {textures.map((texture) => (
                    <div key={texture.id} className="bg-white/5 rounded-lg p-4">
                      <img 
                        src={`${API_BASE_URL.replace('/api', '')}${texture.url}`} 
                        alt={texture.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <h3 className="text-white font-medium truncate">{texture.name}</h3>
                      <p className="text-blue-200 text-sm">{formatFileSize(texture.size)}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteTexture(texture.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="furniture" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Управление мебелью</CardTitle>
                <CardDescription className="text-blue-200">
                  Добавление и редактирование предметов мебели
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить мебель
                  </Button>
                  <Button onClick={loadFurniture} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {furniture.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">{item.name}</h3>
                        <p className="text-blue-200 text-sm">{item.category}</p>
                        <p className="text-blue-200 text-sm">
                          {item.dimensions.width}×{item.dimensions.height}×{item.dimensions.depth} см
                        </p>
                        <p className="text-white font-medium">{item.price} ₽</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteFurniture(item._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Управление проектами</CardTitle>
                <CardDescription className="text-blue-200">
                  Просмотр и управление проектами пользователей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-6">
                  <Button onClick={loadProjects} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">{project.name}</h3>
                        <p className="text-blue-200 text-sm">ID пользователя: {project.userId}</p>
                        <p className="text-blue-200 text-sm">
                          Создан: {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteProject(project._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel; 