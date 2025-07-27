import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Download, 
  FileText, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CNCExporterProps {
  project: any;
  onExport: (format: string, machine: string) => void;
}

// Поддерживаемые станки
const CNC_MACHINES = {
  homag: {
    name: 'Homag',
    formats: ['HPGL', 'DXF', 'JSON'],
    description: 'Немецкие станки для мебельного производства'
  },
  biesse: {
    name: 'Biesse',
    formats: ['HPGL', 'DXF', 'XML'],
    description: 'Итальянские станки для обработки дерева'
  },
  felder: {
    name: 'Felder',
    formats: ['DXF', 'JSON'],
    description: 'Австрийские станки для столярных работ'
  },
  griggio: {
    name: 'Griggio',
    formats: ['HPGL', 'DXF'],
    description: 'Итальянские станки для мебельного производства'
  }
};

// Форматы экспорта
const EXPORT_FORMATS = {
  HPGL: {
    name: 'HPGL',
    description: 'Hewlett-Packard Graphics Language',
    extension: '.hpgl',
    machines: ['homag', 'biesse', 'griggio']
  },
  DXF: {
    name: 'DXF',
    description: 'Drawing Exchange Format',
    extension: '.dxf',
    machines: ['homag', 'biesse', 'felder', 'griggio']
  },
  JSON: {
    name: 'JSON',
    description: 'JavaScript Object Notation',
    extension: '.json',
    machines: ['homag', 'felder']
  },
  XML: {
    name: 'XML',
    description: 'Extensible Markup Language',
    extension: '.xml',
    machines: ['biesse']
  }
};

export default function CNCExporter({ project, onExport }: CNCExporterProps) {
  const [selectedMachine, setSelectedMachine] = useState('homag');
  const [selectedFormat, setSelectedFormat] = useState('HPGL');
  const [exportState, setExportState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleExport = async () => {
    setExportState('loading');
    try {
      await onExport(selectedFormat, selectedMachine);
      setExportState('success');
      setTimeout(() => setExportState('idle'), 2000);
    } catch (error) {
      setExportState('error');
      setTimeout(() => setExportState('idle'), 3000);
    }
  };

  const getAvailableFormats = (machine: string) => {
    return CNC_MACHINES[machine as keyof typeof CNC_MACHINES]?.formats || [];
  };

  const getAvailableMachines = (format: string) => {
    return EXPORT_FORMATS[format as keyof typeof EXPORT_FORMATS]?.machines || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Экспорт для ЧПУ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Выбор станка */}
        <div>
          <Label>Станок с ЧПУ</Label>
          <Select value={selectedMachine} onValueChange={setSelectedMachine}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CNC_MACHINES).map(([key, machine]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span className="font-medium">{machine.name}</span>
                    <span className="text-xs text-gray-500">{machine.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Выбор формата */}
        <div>
          <Label>Формат файла</Label>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailableFormats(selectedMachine).map(format => (
                <SelectItem key={format} value={format}>
                  <div className="flex flex-col">
                    <span className="font-medium">{EXPORT_FORMATS[format as keyof typeof EXPORT_FORMATS].name}</span>
                    <span className="text-xs text-gray-500">
                      {EXPORT_FORMATS[format as keyof typeof EXPORT_FORMATS].description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Информация о проекте */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h4 className="font-semibold mb-2">Параметры проекта</h4>
          <div className="text-sm space-y-1">
            <div>Тип: {project.furnitureType}</div>
            <div>Размеры: {project.dimensions?.width}×{project.dimensions?.height}×{project.dimensions?.depth}см</div>
            <div>Материал: {project.material}</div>
            <div>Элементы: {project.features?.shelves} полок, {project.features?.doors} дверей, {project.features?.drawers} ящиков</div>
          </div>
        </div>

        {/* Статус экспорта */}
        {exportState === 'success' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Файл успешно экспортирован!</span>
          </div>
        )}

        {exportState === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Ошибка при экспорте</span>
          </div>
        )}

        {/* Кнопка экспорта */}
        <Button 
          onClick={handleExport} 
          disabled={exportState === 'loading'}
          className="w-full"
        >
          {exportState === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Экспорт...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Экспорт {selectedFormat}
            </>
          )}
        </Button>

        {/* Дополнительные настройки */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Настройки экспорта</Label>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>• Точность: 0.1 мм</div>
            <div>• Единицы: миллиметры</div>
            <div>• Координаты: абсолютные</div>
            <div>• Скорость: 10000 мм/мин</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 