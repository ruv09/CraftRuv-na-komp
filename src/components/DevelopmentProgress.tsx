import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star,
  Zap,
  Target,
  Rocket
} from 'lucide-react';

interface Feature {
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  progress: number;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const features: Feature[] = [
  {
    name: 'Параметрический калькулятор',
    status: 'completed',
    progress: 100,
    description: 'Базовый функционал расчета стоимости мебели',
    priority: 'high'
  },
  {
    name: '3D визуализация',
    status: 'completed',
    progress: 100,
    description: 'Интерактивная 3D модель с Three.js',
    priority: 'high'
  },
  {
    name: 'ИИ-ассистент',
    status: 'completed',
    progress: 90,
    description: 'Голосовой ввод и оптимизация параметров',
    priority: 'high'
  },
  {
    name: 'CNC экспорт',
    status: 'in-progress',
    progress: 60,
    description: 'Экспорт в форматы HPGL, DXF, JSON, XML',
    priority: 'high'
  },
  {
    name: 'Автоматическая раскройка',
    status: 'planned',
    progress: 0,
    description: 'Оптимизация раскроя листовых материалов',
    priority: 'medium'
  },
  {
    name: 'AR предварительный просмотр',
    status: 'planned',
    progress: 0,
    description: 'Просмотр мебели в интерьере через камеру',
    priority: 'medium'
  },
  {
    name: 'Интеграция с ERP',
    status: 'planned',
    progress: 0,
    description: 'Подключение к 1C, SAP и другим системам',
    priority: 'low'
  },
  {
    name: 'IoT мониторинг',
    status: 'planned',
    progress: 0,
    description: 'Подключение к станкам через OPC UA',
    priority: 'low'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'in-progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'planned':
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Zap className="h-3 w-3 text-red-500" />;
    case 'medium':
      return <Target className="h-3 w-3 text-yellow-500" />;
    case 'low':
      return <Star className="h-3 w-3 text-blue-500" />;
    default:
      return <Star className="h-3 w-3 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Завершено</Badge>;
    case 'in-progress':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">В разработке</Badge>;
    case 'planned':
      return <Badge variant="outline">Запланировано</Badge>;
    default:
      return <Badge variant="outline">Неизвестно</Badge>;
  }
};

export default function DevelopmentProgress() {
  const completedFeatures = features.filter(f => f.status === 'completed').length;
  const inProgressFeatures = features.filter(f => f.status === 'in-progress').length;
  const plannedFeatures = features.filter(f => f.status === 'planned').length;
  const totalProgress = Math.round((completedFeatures / features.length) * 100);

  return (
    <div className="space-y-6">
      {/* Общий прогресс */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Прогресс разработки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Общий прогресс</span>
              <span className="text-sm text-gray-600">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedFeatures}</div>
                <div className="text-sm text-green-600">Завершено</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{inProgressFeatures}</div>
                <div className="text-sm text-blue-600">В разработке</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{plannedFeatures}</div>
                <div className="text-sm text-gray-600">Запланировано</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список функций */}
      <Card>
        <CardHeader>
          <CardTitle>Функции и их статус</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(feature.status)}
                    <h4 className="font-semibold">{feature.name}</h4>
                    {getPriorityIcon(feature.priority)}
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {feature.description}
                </p>
                
                {feature.status === 'in-progress' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Прогресс</span>
                      <span>{feature.progress}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Следующие шаги */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Target className="h-5 w-5" />
            Следующие шаги
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold">Завершение CNC экспорта</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Реализация генерации файлов для станков Homag, Biesse, Felder, Griggio
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold">Алгоритм раскройки</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Разработка алгоритма оптимизации раскроя листовых материалов
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold">AR функциональность</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Интеграция WebXR для предварительного просмотра мебели в интерьере
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Технические достижения */}
      <Card>
        <CardHeader>
          <CardTitle>Технические достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700 dark:text-green-300">✅ Реализовано</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Параметрическое проектирование мебели</li>
                <li>• 3D визуализация с Three.js</li>
                <li>• ИИ-ассистент с голосовым вводом</li>
                <li>• Интеграция OpenAI GPT-4 и DALL-E</li>
                <li>• Автоматический расчет стоимости</li>
                <li>• Responsive дизайн</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">🚀 В разработке</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• CNC экспорт (HPGL, DXF, JSON, XML)</li>
                <li>• Алгоритм оптимизации раскроя</li>
                <li>• Сохранение и загрузка проектов</li>
                <li>• Пользовательские шаблоны</li>
                <li>• Интеграция с облачными сервисами</li>
                <li>• Мобильное приложение</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 