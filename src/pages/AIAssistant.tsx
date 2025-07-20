import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import Furniture3DViewer from '../components/Furniture3DViewer';
import { Loader2, Download, Save } from 'lucide-react';

// Мобильный first UI для AI-ассистента
const defaultParams = {
  roomType: '',
  style: '',
  budget: '',
  dimensions: { width: '', height: '', depth: '' },
  requirements: '',
};

export default function AIAssistant() {
  const [params, setParams] = useState(defaultParams);
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'questions' | 'result'>('idle');
  const [questions, setQuestions] = useState<string[]>([]);
  const [advice, setAdvice] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [model, setModel] = useState<any>(null);
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

  // Отправка параметров на backend
  const handleSend = async () => {
    setAiState('loading');
    setChat((c) => [...c, { role: 'user', text: JSON.stringify(params) }]);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          requirements: params.requirements ? params.requirements.split(',').map(s => s.trim()) : [],
          dimensions: {
            width: Number(params.dimensions.width),
            height: Number(params.dimensions.height),
            depth: Number(params.dimensions.depth),
          },
        }),
      });
      const data = await res.json();
      if (data.needMoreInfo && data.data?.questions) {
        setQuestions(data.data.questions);
        setAiState('questions');
        setChat((c) => [...c, { role: 'ai', text: data.data.questions.join('\n') }]);
      } else if (data.data) {
        setModel(data.data.model);
        setAdvice(data.data.advice || []);
        setImageUrl(data.data.imageUrl || null);
        setAiState('result');
        setChat((c) => [...c, { role: 'ai', text: 'Готово! Вот параметры и советы.' }]);
      }
    } catch (e) {
      setChat((c) => [...c, { role: 'ai', text: 'Ошибка AI. Попробуйте позже.' }]);
      setAiState('idle');
    }
  };

  // Ответ на уточняющие вопросы
  const handleAnswer = (answers: string[]) => {
    // Применяем ответы к params (упрощённо: по порядку)
    const keys = ['roomType', 'style', 'budget', 'dimensions.width', 'dimensions.height', 'dimensions.depth', 'requirements'];
    const newParams = { ...params };
    answers.forEach((ans, i) => {
      const key = keys[i];
      if (key.startsWith('dimensions.')) {
        const dim = key.split('.')[1];
        newParams.dimensions[dim] = ans;
      } else {
        newParams[key] = ans;
      }
    });
    setParams(newParams);
    setQuestions([]);
    setAiState('idle');
  };

  // UI для ответов на вопросы
  const [answers, setAnswers] = useState<string[]>([]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-2">
      <div className="w-full max-w-md mx-auto flex flex-col gap-4">
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>AI-ассистент по мебели</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 3D визуализация или изображение */}
            <div className="flex justify-center mb-4">
              {imageUrl ? (
                <img src={imageUrl} alt="AI visualization" className="rounded-lg w-64 h-64 object-contain bg-white transition-all duration-700 shadow-md" style={{ opacity: aiState === 'loading' ? 0.5 : 1 }} />
              ) : (
                <Furniture3DViewer
                  width={Number(params.dimensions.width) || 100}
                  height={Number(params.dimensions.height) || 200}
                  depth={Number(params.dimensions.depth) || 40}
                  furnitureType={params.roomType || 'shelf'}
                  material={params.style || 'wood'}
                />
              )}
            </div>

            {/* Панель параметров */}
            <div className="space-y-2 mb-4">
              <Label>Тип комнаты</Label>
              <Input value={params.roomType} onChange={e => setParams({ ...params, roomType: e.target.value })} placeholder="bedroom, kitchen..." />
              <Label>Стиль</Label>
              <Input value={params.style} onChange={e => setParams({ ...params, style: e.target.value })} placeholder="modern, classic..." />
              <Label>Бюджет</Label>
              <Input value={params.budget} onChange={e => setParams({ ...params, budget: e.target.value })} placeholder="50000" type="number" />
              <Label>Размеры (см)</Label>
              <div className="flex gap-2">
                <Input value={params.dimensions.width} onChange={e => setParams({ ...params, dimensions: { ...params.dimensions, width: e.target.value } })} placeholder="Ширина" type="number" />
                <Input value={params.dimensions.height} onChange={e => setParams({ ...params, dimensions: { ...params.dimensions, height: e.target.value } })} placeholder="Высота" type="number" />
                <Input value={params.dimensions.depth} onChange={e => setParams({ ...params, dimensions: { ...params.dimensions, depth: e.target.value } })} placeholder="Глубина" type="number" />
              </div>
              <Label>Особые требования</Label>
              <Input value={params.requirements} onChange={e => setParams({ ...params, requirements: e.target.value })} placeholder="угловой, белый цвет..." />
            </div>

            {/* Кнопка отправки */}
            <Button className="w-full" onClick={handleSend} disabled={aiState === 'loading'}>
              {aiState === 'loading' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI думает...</> : 'Запросить у AI'}
            </Button>

            {/* Ответы AI */}
            <div className="mt-4 space-y-2">
              {aiState === 'questions' && questions.length > 0 && (
                <form onSubmit={e => { e.preventDefault(); handleAnswer(answers); }} className="space-y-2">
                  <div className="mb-2 font-semibold">AI уточняет:</div>
                  {questions.map((q, i) => (
                    <Input key={i} value={answers[i] || ''} onChange={e => {
                      const arr = [...answers]; arr[i] = e.target.value; setAnswers(arr);
                    }} placeholder={q} />
                  ))}
                  <Button type="submit" className="w-full mt-2">Ответить</Button>
                </form>
              )}
              {aiState === 'result' && (
                <div>
                  <div className="font-semibold mb-1">Советы по сборке:</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-200">
                    {advice.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                  {model && (
                    <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 mt-2 text-xs overflow-x-auto">
                      {JSON.stringify(model, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Чат-история (минимал) */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
          <div className="font-semibold mb-2">История диалога</div>
          <div className="max-h-40 overflow-y-auto text-xs space-y-1">
            {chat.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}>
                <b>{msg.role === 'user' ? 'Вы:' : 'AI:'}</b> {msg.text}
              </div>
            ))}
          </div>
        </div>
        {/* Экспорт/сохранение */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1 flex items-center gap-2" disabled><Download className="h-4 w-4" />Экспорт</Button>
          <Button variant="outline" className="flex-1 flex items-center gap-2" disabled><Save className="h-4 w-4" />Сохранить</Button>
        </div>
      </div>
    </div>
  );
} 