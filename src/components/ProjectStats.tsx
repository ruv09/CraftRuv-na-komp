import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Ruler, 
  Package, 
  Clock,
  CheckCircle,
  AlertCircle,
  Bot
} from 'lucide-react';

interface ProjectStatsProps {
  project: any;
  aiOptimization?: {
    costReduction: number;
    materialEfficiency: number;
    timeSaved: number;
    suggestions: string[];
  };
}

export default function ProjectStats({ project, aiOptimization }: ProjectStatsProps) {
  const calculateMaterialEfficiency = () => {
    const volume = (project.dimensions.width * project.dimensions.height * project.dimensions.depth) / 1000000;
    const material = project.material;
    const density = {
      oak: 750,
      pine: 520,
      birch: 650,
      laminate_white: 650,
      laminate_oak: 650,
      veneer_oak: 650,
      mdf_white: 750,
      mdf_colored: 750
    }[material] || 650;
    
    return Math.round(volume * density);
  };

  const calculateWastePercentage = () => {
    // Простая логика расчета отходов
    const totalArea = project.dimensions.width * project.dimensions.height * 2 + 
                     project.dimensions.width * project.dimensions.depth * 2 +
                     project.dimensions.height * project.dimensions.depth * 2;
    const standardSheet = 1830 * 2750; // мм²
    const sheetsNeeded = Math.ceil(totalArea / standardSheet);
    const waste = (sheetsNeeded * standardSheet - totalArea) / (sheetsNeeded * standardSheet) * 100;
    return Math.round(waste);
  };

  const materialEfficiency = calculateMaterialEfficiency();
  const wastePercentage = calculateWastePercentage();

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Стоимость</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.cost?.toLocaleString()} ₽</div>
            {aiOptimization?.costReduction && (
              <div className="flex items-center text-xs text-green-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                Экономия {aiOptimization.costReduction}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Объем</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialEfficiency} кг</div>
            <p className="text-xs text-muted-foreground">
              {project.dimensions.width}×{project.dimensions.height}×{project.dimensions.depth} см
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отходы</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wastePercentage}%</div>
            <Progress value={wastePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Время сборки</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4-6 ч</div>
            {aiOptimization?.timeSaved && (
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Быстрее на {aiOptimization.timeSaved}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Детальная информация */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Материалы и фурнитура */}
        <Card>
          <CardHeader>
            <CardTitle>Материалы и фурнитура</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Основной материал</span>
                <Badge variant="outline">{project.material}</Badge>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Петли</span>
                <Badge variant="outline">{project.hardware?.hinges}</Badge>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Ручки</span>
                <Badge variant="outline">{project.hardware?.handles}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Направляющие</span>
                <Badge variant="outline">{project.hardware?.slides}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Элементы мебели */}
        <Card>
          <CardHeader>
            <CardTitle>Элементы мебели</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{project.features?.shelves || 0}</div>
                <div className="text-sm text-blue-600">Полки</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{project.features?.doors || 0}</div>
                <div className="text-sm text-green-600">Двери</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{project.features?.drawers || 0}</div>
                <div className="text-sm text-purple-600">Ящики</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{project.features?.legs || 0}</div>
                <div className="text-sm text-orange-600">Ножки</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Оптимизация ИИ */}
      {aiOptimization && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              Оптимизация ИИ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{aiOptimization.costReduction}%</div>
                <div className="text-sm text-green-600">Экономия</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{aiOptimization.materialEfficiency}%</div>
                <div className="text-sm text-blue-600">Эффективность материалов</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{aiOptimization.timeSaved}%</div>
                <div className="text-sm text-purple-600">Время сборки</div>
              </div>
            </div>

            {aiOptimization.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Рекомендации ИИ:</h4>
                <ul className="space-y-1">
                  {aiOptimization.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Предупреждения */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <AlertCircle className="h-5 w-5" />
            Проверка проекта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {wastePercentage > 20 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Высокий процент отходов ({wastePercentage}%). Рассмотрите альтернативные размеры.</span>
              </div>
            )}
            {project.dimensions.height > 250 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Высота может быть слишком большой для стандартных помещений.</span>
              </div>
            )}
            {project.cost > 50000 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Высокая стоимость. Рассмотрите альтернативные материалы.</span>
              </div>
            )}
            {!aiOptimization && (
              <div className="flex items-center gap-2 text-blue-600">
                <Bot className="h-4 w-4" />
                <span className="text-sm">Попробуйте ИИ-ассистент для оптимизации проекта.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 