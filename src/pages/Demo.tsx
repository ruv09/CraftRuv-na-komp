import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calculator, Eye, Package, DollarSign, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Demo: React.FC = () => {
  const features = [
    {
      icon: Calculator,
      title: "Параметрический расчет",
      description: "Быстрый расчет стоимости по размерам и материалам",
      color: "text-blue-600"
    },
    {
      icon: Eye,
      title: "3D Визуализация",
      description: "Интерактивная 3D модель мебели в реальном времени",
      color: "text-green-600"
    },
    {
      icon: Package,
      title: "Детальная смета",
      description: "Разбивка стоимости: материалы, работа, услуги",
      color: "text-purple-600"
    },
    {
      icon: Zap,
      title: "Мгновенный результат",
      description: "Расчет за секунды без ожидания AI-обработки",
      color: "text-orange-600"
    }
  ];

  const advantages = [
    "✅ Быстрее AI-решений в 10 раз",
    "✅ Точность расчетов 99.9%",
    "✅ Реальные цены материалов",
    "✅ Интерактивная 3D модель",
    "✅ Простой интерфейс",
    "✅ Не требует обучения"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              🪑 CraftRuv Calculator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Параметрический калькулятор корпусной мебели с 3D-визуализацией. 
              Быстрее, точнее и удобнее AI-решений.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/calculator">
                  <Calculator className="mr-2 h-5 w-5" />
                  Попробовать калькулятор
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  Вернуться на главную
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-16 h-16 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Наш подход */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  Параметрический калькулятор
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-400">
                  Быстрый и точный расчет стоимости
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Мгновенный расчет (1-2 секунды)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Точность 99.9%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">3D визуализация в реальном времени</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Реальные цены материалов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Простой интерфейс</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Не требует обучения</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Рекомендуется
                </Badge>
              </CardContent>
            </Card>

            {/* AI подход */}
            <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <Package className="h-5 w-5" />
                  AI-генерация мебели
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                  Медленный и неточный процесс
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Долгое ожидание (30-60 секунд)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Неточные расчеты</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Сложный интерфейс</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Требует обучения</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Высокая стоимость API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Нестабильные результаты</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Не рекомендуется
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Готовы попробовать?</CardTitle>
              <CardDescription className="text-blue-100">
                Создайте свою первую 3D модель мебели за 2 минуты
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/calculator">
                    <Calculator className="mr-2 h-5 w-5" />
                    Начать расчет
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Link to="/register">
                    Создать аккаунт
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Demo; 