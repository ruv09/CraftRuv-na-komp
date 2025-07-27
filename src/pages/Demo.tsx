import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import Furniture3DViewer from '../components/Furniture3DViewer';
import { 
  Bot, 
  Calculator, 
  Eye, 
  Settings, 
  Sparkles,
  Mic,
  CheckCircle,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

export default function Demo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoData, setDemoData] = useState({
    original: { width: 100, height: 200, depth: 60, furnitureType: 'cabinet', material: 'oak' },
    aiOptimized: { width: 180, height: 220, depth: 55, furnitureType: 'wardrobe', material: 'laminate_white' }
  });

  const steps = [
    {
      title: "1. Голосовой запрос к ИИ",
      description: "Пользователь говорит: 'Сделай шкаф для спальни современного стиля'",
      icon: <Mic className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="font-semibold text-blue-800 dark:text-blue-200">Голосовой ввод:</div>
            <div className="text-blue-600 dark:text-blue-300">"Сделай шкаф для спальни современного стиля"</div>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-green-600" />
            <span className="text-sm">ИИ анализирует запрос...</span>
          </div>
        </div>
      )
    },
    {
      title: "2. ИИ создает параметры",
      description: "ИИ генерирует оптимальные размеры, материал и конфигурацию",
      icon: <Bot className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <div className="font-semibold text-sm mb-2">Исходные параметры:</div>
              <div className="text-xs space-y-1">
                <div>Тип: Шкаф</div>
                <div>Размеры: 100×200×60 см</div>
                <div>Материал: Дуб</div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <div className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300">Оптимизировано ИИ:</div>
              <div className="text-xs space-y-1 text-green-600 dark:text-green-400">
                <div>Тип: Гардероб</div>
                <div>Размеры: 180×220×55 см</div>
                <div>Материал: ЛДСП белый</div>
                <div>Полки: 4, Двери: 3, Ящики: 2</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Калькулятор строит 3D модель",
      description: "Параметрический калькулятор создает интерактивную 3D модель",
      icon: <Calculator className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
            <Furniture3DViewer
              width={demoData.aiOptimized.width}
              height={demoData.aiOptimized.height}
              depth={demoData.aiOptimized.depth}
              furnitureType={demoData.aiOptimized.furnitureType}
              material={demoData.aiOptimized.material}
              features={{ shelves: 4, doors: 3, drawers: 2 }}
            />
          </div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Интерактивная 3D модель с полками, дверями и ящиками
          </div>
        </div>
      )
    },
    {
      title: "4. Расчет стоимости",
      description: "Автоматический расчет материалов, фурнитуры и работы",
      icon: <Calculator className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-center">
              <div className="text-2xl font-bold text-blue-600">₽12,450</div>
              <div className="text-xs text-blue-600">Материалы</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-center">
              <div className="text-2xl font-bold text-green-600">₽3,200</div>
              <div className="text-xs text-green-600">Фурнитура</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded text-center">
              <div className="text-2xl font-bold text-purple-600">₽2,000</div>
              <div className="text-xs text-purple-600">Работа</div>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">Итого: ₽17,650</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Экономия 15% благодаря оптимизации ИИ</div>
          </div>
        </div>
      )
    },
    {
      title: "5. Экспорт для производства",
      description: "Генерация файлов для станков с ЧПУ",
      icon: <Settings className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-semibold">Поддерживаемые станки:</div>
              <div className="space-y-1">
                <Badge variant="outline">Homag</Badge>
                <Badge variant="outline">Biesse</Badge>
                <Badge variant="outline">Felder</Badge>
                <Badge variant="outline">Griggio</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">Форматы экспорта:</div>
              <div className="space-y-1">
                <Badge variant="outline">HPGL</Badge>
                <Badge variant="outline">DXF</Badge>
                <Badge variant="outline">JSON</Badge>
                <Badge variant="outline">XML</Badge>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="font-semibold">Готово к производству!</span>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              Файл оптимизирован для станка Homag, формат HPGL
            </div>
          </div>
        </div>
      )
    }
  ];

  const startDemo = () => {
    setIsPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
        step = 0;
      }
      setCurrentStep(step);
    }, 3000);
  };

  const stopDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Демонстрация интеграции ИИ с калькулятором</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Посмотрите, как ИИ-ассистент работает в паре с параметрическим калькулятором
        </p>
        
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={isPlaying ? stopDemo : startDemo}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Остановить' : 'Запустить'} демо
          </Button>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Шаг {currentStep + 1} из {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Текущий шаг */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {steps[currentStep].icon}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {steps[currentStep].content}
        </CardContent>
      </Card>

      {/* Навигация по шагам */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Предыдущий шаг
        </Button>
        
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Следующий шаг
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Преимущества интеграции */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Умная оптимизация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              ИИ анализирует требования и создает оптимальные параметры для экономии материалов и улучшения функциональности.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Мгновенная визуализация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              3D модель обновляется в реальном времени, показывая результат оптимизации ИИ.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Готовность к производству
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Автоматическая генерация файлов для станков с ЧПУ в различных форматах.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Призыв к действию */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Попробуйте сами!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Создайте свой проект мебели с помощью ИИ-ассистента
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Открыть ИИ-ассистент
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Редактор проектов
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 