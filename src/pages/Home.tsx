import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Zap, 
  Shield,
  Palette,
  Ruler,
  Calculator,
  Eye,
  Download
} from 'lucide-react';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "🪑 CraftRuv",
      subtitle: "Профессиональный конструктор мебели с ИИ-ассистентом",
      description: "Превращаем ваши идеи в готовые изделия за 3 простых шага",
      image: "/hero-3d-design.jpg",
      gradient: "from-blue-900 via-purple-900 to-indigo-900"
    },
    {
      title: "Проблемы традиционного дизайна",
      subtitle: "Сложные CAD-программы требуют месяцы обучения",
      description: "Долгий процесс от идеи до готового чертежа",
      image: "/traditional-workshop.jpg",
      gradient: "from-gray-800 via-gray-900 to-black"
    },
    {
      title: "CraftRuv - Революция в дизайне",
      subtitle: "Интуитивный интерфейс вместо сложных программ",
      description: "От идеи до готового проекта за 15 минут",
      image: "/ai-assistant.jpg",
      gradient: "from-emerald-900 via-teal-900 to-cyan-900"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const features = [
    {
      icon: Palette,
      title: "3D Проектирование",
      description: "Создавайте реалистичные 3D модели мебели с точными размерами"
    },
    {
      icon: Ruler,
      title: "Точные расчеты",
      description: "Автоматический расчет материалов и стоимости проекта"
    },
    {
      icon: Calculator,
      title: "ИИ-помощник",
      description: "Получайте рекомендации по оптимизации конструкции"
    },
    {
      icon: Eye,
      title: "AR-предпросмотр",
      description: "Увидьте мебель в вашем интерьере через дополненную реальность"
    },
    {
      icon: Download,
      title: "Экспорт чертежей",
      description: "Готовые чертежи для производства в различных форматах"
    },
    {
      icon: Shield,
      title: "Безопасность",
      description: "Ваши проекты защищены и синхронизированы в облаке"
    }
  ];

  const stats = [
    { value: "95%", label: "Экономия времени" },
    { value: "30%", label: "Снижение затрат" },
    { value: "99.9%", label: "Точность расчетов" },
    { value: "10k+", label: "Довольных пользователей" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} transition-all duration-1000`}>
          {slides[currentSlide].image && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            />
          )}
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            {slides[currentSlide].subtitle}
          </p>
          <p className="text-lg text-blue-200 mb-8">
            {slides[currentSlide].description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
              <Link to="/register">
                Начать бесплатно
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-900">
              <Link to="/explore">
                Исследовать проекты
              </Link>
            </Button>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ключевые возможности
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Все необходимые инструменты для создания профессиональной мебели в одном приложении
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Начните создавать уже сегодня!
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Присоединяйтесь к тысячам мастеров, которые уже используют CraftRuv для создания уникальной мебели
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">
                Создать аккаунт
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">
                Войти в систему
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl">🪑</div>
                <span className="text-xl font-bold">CraftRuv</span>
              </div>
              <p className="text-muted-foreground">
                Профессиональный конструктор мебели с ИИ-ассистентом
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Продукт</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">Возможности</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Цены</Link></li>
                <li><Link to="/templates" className="hover:text-foreground">Шаблоны</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Поддержка</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground">Помощь</Link></li>
                <li><Link to="/docs" className="hover:text-foreground">Документация</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Контакты</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Компания</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">О нас</Link></li>
                <li><Link to="/blog" className="hover:text-foreground">Блог</Link></li>
                <li><Link to="/careers" className="hover:text-foreground">Карьера</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CraftRuv. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 