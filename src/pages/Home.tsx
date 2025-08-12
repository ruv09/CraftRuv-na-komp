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
      title: "Калькулятор стоимости",
      description: "Быстрый расчет стоимости корпусной мебели по параметрам"
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
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern"></div>
          <div className="absolute inset-0 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <div className="mb-6 animate-float">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-medium border border-white/20">
              Версия 2.0 — Теперь с ИИ-ассистентом 🚀
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100 animate-fade-in-up animation-delay-200">
            {slides[currentSlide].subtitle}
          </p>
          <p className="text-lg text-blue-200 mb-8 animate-fade-in-up animation-delay-300">
            {slides[currentSlide].description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1">
              <Link to="/register">
                Начать бесплатно
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1">
              <Link to="/explore">
                Исследовать проекты
              </Link>
            </Button>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-primary scale-125 shadow-glow' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Возможности
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Ключевые функции платформы
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Все необходимые инструменты для создания профессиональной мебели в одном приложении
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group text-center border border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-card/80"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
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
      <section className="py-24 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-card/80 backdrop-blur-sm p-8 rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-3">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Готовы начать?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
            Начните создавать уже сегодня!
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам мастеров, которые уже используют CraftRuv для создания уникальной мебели
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1">
              <Link to="/register">
                Создать аккаунт
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <Link to="/calculator">
                <Calculator className="mr-2 h-4 w-4" />
                Калькулятор стоимости
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border/50 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
              <Link to="/login">
                Войти в систему
              </Link>
            </Button>
          </div>
          
          <div className="mt-16 flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Бесплатный старт</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Без кредитной карты</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Отмена в любое время</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-sm border-t border-border py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="text-2xl">🪑</div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">CraftRuv</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Профессиональный конструктор мебели с ИИ-ассистентом
              </p>
              <div className="flex space-x-4 mt-6">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Продукт</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary transition-colors">Возможности</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Цены</Link></li>
                <li><Link to="/templates" className="hover:text-primary transition-colors">Шаблоны</Link></li>
                <li><Link to="/showcase" className="hover:text-primary transition-colors">Примеры работ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Поддержка</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/help" className="hover:text-primary transition-colors">Помощь</Link></li>
                <li><Link to="/docs" className="hover:text-primary transition-colors">Документация</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Контакты</Link></li>
                <li><Link to="/faq" className="hover:text-primary transition-colors">Частые вопросы</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Компания</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">О нас</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Блог</Link></li>
                <li><Link to="/careers" className="hover:text-primary transition-colors">Карьера</Link></li>
                <li><Link to="/partners" className="hover:text-primary transition-colors">Партнеры</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-12 pt-8 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} CraftRuv. Все права защищены.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">Политика конфиденциальности</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Условия использования</Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">Политика cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;