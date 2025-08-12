import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/use-theme';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { 
  Home, 
  FolderPlus, 
  Folders, 
  Compass, 
  User, 
  Settings, 
  Shield, 
  Hammer, 
  Calculator, 
  Palette, 
  Bot, 
  LogOut,
  Menu,
  X,
  Bell, 
  Moon, 
  Sun, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Search,
  Plus,
  FolderOpen,
  Ruler,
  Sparkles
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface BadgeData {
  text: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: BadgeData | null;
}

interface ToolItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Эффект для проверки монтирования компонента (для корректной работы темы)
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation: NavItem[] = [
    { name: 'Главная', href: '/dashboard', icon: Home, badge: null },
    { name: 'Новый проект', href: '/projects/new', icon: Plus, badge: null },
    { name: 'Мои проекты', href: '/projects', icon: FolderOpen, badge: null },
    { name: 'Исследовать', href: '/explore', icon: Compass, badge: { text: 'Новое', variant: 'secondary' } },
    { name: 'Профиль', href: '/profile', icon: User, badge: null },
    { name: 'Настройки', href: '/settings', icon: Settings, badge: null },
    ...(user?.role === 'admin' ? [{ name: 'Админ панель', href: '/admin', icon: Shield, badge: null }] : []),
  ];

  const tools: ToolItem[] = [
    { name: 'Конструктор', href: '/builder', icon: Ruler, description: 'Создание 3D моделей мебели' },
    { name: 'Калькулятор', href: '/calculator', icon: Calculator, description: 'Расчет стоимости материалов' },
    { name: 'Палитра', href: '/palette', icon: Palette, description: 'Подбор цветовых схем' },
    { name: 'AI-ассистент', href: '/ai-assistant', icon: Sparkles, description: 'Помощь в проектировании' },
  ];
  
  const notifications = [
    { id: 1, title: 'Новый комментарий', message: 'Пользователь оставил комментарий к вашему проекту', time: '5 мин назад', read: false },
    { id: 2, title: 'Обновление системы', message: 'Доступна новая версия приложения', time: '1 час назад', read: true },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
  };

  // Если компонент не смонтирован, возвращаем пустой div для избежания мерцания при загрузке темы
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-card border-r border-border transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl">🪑</div>
              {!sidebarCollapsed && <span className="text-xl font-bold">CraftRuv</span>}
            </Link>
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden lg:flex"
                      onClick={toggleSidebar}
                    >
                      {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {sidebarCollapsed ? 'Развернуть' : 'Свернуть'} боковую панель
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            </div>
          </div>

          {/* User info */}
          <div className={`${sidebarCollapsed ? 'p-3' : 'p-4'} border-b border-border`}>
            <div className={`flex ${sidebarCollapsed ? 'justify-center' : 'items-center space-x-3'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto">
                    <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Профиль</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Настройки</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className={`px-4 py-2 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Поиск..."
                className="w-full pl-8 bg-muted/50 h-9 rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={searchOpen ? searchQuery : ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 100)}
              />
              {searchOpen && searchQuery && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-card border border-border rounded-md shadow-md z-50">
                  <div className="text-xs text-muted-foreground mb-2">Результаты поиска</div>
                  <div className="space-y-1">
                    {/* Здесь будут результаты поиска */}
                    <div className="text-sm p-2 hover:bg-accent rounded-md cursor-pointer">Результат поиска 1</div>
                    <div className="text-sm p-2 hover:bg-accent rounded-md cursor-pointer">Результат поиска 2</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <TooltipProvider key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={`
                            flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                          {!sidebarCollapsed && <span>{item.name}</span>}
                          {!sidebarCollapsed && item.badge && (
                            <Badge variant={item.badge.variant} className="ml-auto">
                              {item.badge.text}
                            </Badge>
                          )}
                          {sidebarCollapsed && item.badge && (
                            <Badge variant={item.badge.variant} className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                              •
                            </Badge>
                          )}
                  </Link>
                      </TooltipTrigger>
                      {sidebarCollapsed && (
                        <TooltipContent side="right">
                          {item.name}
                          {item.badge && (
                            <span className="ml-2">
                              <Badge variant={item.badge.variant} className="text-xs">
                                {item.badge.text}
                              </Badge>
                            </span>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {/* Tools section */}
            <div className="pt-6">
              <h3 className={`${sidebarCollapsed ? 'text-center' : 'px-3'} text-xs font-semibold text-muted-foreground uppercase tracking-wider`}>
                {!sidebarCollapsed && 'Инструменты'}
              </h3>
              <div className="mt-2 space-y-1">
                {tools.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <TooltipProvider key={item.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={`
                              flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                            {!sidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                        </TooltipTrigger>
                        {sidebarCollapsed && (
                          <TooltipContent side="right">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                          <Bell className="h-4 w-4" />
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center">
                              {notifications.filter(n => !n.read).length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                          <span>Уведомления</span>
                          {notifications.filter(n => !n.read).length > 0 && (
                            <Button variant="ghost" size="sm" className="h-auto py-0 px-2 text-xs">
                              Отметить все как прочитанные
                            </Button>
                          )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer">
                              <div className="flex items-center w-full">
                                <div className={`h-2 w-2 rounded-full mr-2 ${notification.read ? 'bg-muted' : 'bg-primary'}`} />
                                <span className="font-medium flex-1">{notification.title}</span>
                                <span className="text-xs text-muted-foreground">{notification.time}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            Нет новых уведомлений
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="top">Уведомления</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Помощь</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>План:</span>
                <span className="font-medium text-foreground">
                  {user?.subscription?.plan === 'free' ? 'Бесплатный' : 
                   user?.subscription?.plan === 'basic' ? 'Базовый' : 'Про'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 