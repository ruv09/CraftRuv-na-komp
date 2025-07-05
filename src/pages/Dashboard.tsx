import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Plus, 
  FolderOpen, 
  TrendingUp, 
  Clock, 
  Star,
  Eye,
  Download,
  Palette,
  Ruler,
  Calculator,
  Sparkles
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, getProjects, isLoading } = useProjects();
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalViews: 0,
    totalLikes: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getProjects();
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchData();
  }, [getProjects]);

  useEffect(() => {
    // Calculate stats from projects
    const calculatedStats = projects.reduce((acc, project) => {
      acc.totalProjects++;
      if (project.status === 'completed') acc.completedProjects++;
      acc.totalViews += project.views;
      acc.totalLikes += project.likeCount;
      return acc;
    }, { totalProjects: 0, completedProjects: 0, totalViews: 0, totalLikes: 0 });

    setStats(calculatedStats);
  }, [projects]);

  const recentProjects = projects.slice(0, 3);

  const quickActions = [
    {
      title: 'Новый проект',
      description: 'Создайте новый проект мебели',
      icon: Plus,
      href: '/projects/new',
      color: 'bg-blue-500'
    },
    {
      title: 'Шаблоны',
      description: 'Выберите готовый шаблон',
      icon: Palette,
      href: '/templates',
      color: 'bg-green-500'
    },
    {
      title: 'Калькулятор',
      description: 'Рассчитайте материалы и стоимость',
      icon: Calculator,
      href: '/calculator',
      color: 'bg-purple-500'
    },
    {
      title: 'ИИ-помощник',
      description: 'Получите рекомендации от ИИ',
      icon: Sparkles,
      href: '/ai-assistant',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Добро пожаловать, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          Готовы создать что-то удивительное сегодня?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего проектов</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}% завершено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              +12% с прошлого месяца
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Лайки</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
            <p className="text-xs text-muted-foreground">
              +8% с прошлого месяца
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активность</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              +2% с прошлой недели
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={action.href}>
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Недавние проекты</h2>
          <Button asChild variant="outline">
            <Link to="/projects">
              Все проекты
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'completed' ? 'Завершен' :
                       project.status === 'in_progress' ? 'В работе' : 'Черновик'}
                    </span>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Размеры:</span>
                      <span>{project.dimensions.width}×{project.dimensions.height}×{project.dimensions.depth} {project.dimensions.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Стоимость:</span>
                      <span>{project.metadata.totalCost.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{project.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{project.likeCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/projects/${project._id}`}>
                        Открыть
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🪑</div>
              <h3 className="text-xl font-semibold mb-2">У вас пока нет проектов</h3>
              <p className="text-muted-foreground mb-6">
                Создайте свой первый проект мебели и начните творить!
              </p>
              <Button asChild>
                <Link to="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать проект
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tips & Tricks */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Совет дня</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Используйте ИИ-помощника для оптимизации конструкции и выбора материалов. 
            Это поможет сэкономить до 30% на материалах и улучшить эргономику мебели.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 