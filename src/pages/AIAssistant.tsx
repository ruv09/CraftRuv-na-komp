import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import Furniture3DViewer from '../components/Furniture3DViewer';
import { 
  Loader2, 
  Download, 
  Save, 
  Mic, 
  MicOff, 
  Bot, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Volume2,
  Settings
} from 'lucide-react';

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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  // Голосовой ввод
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ru-RU';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          processVoiceInput(transcript);
        }
      };

      recognitionRef.current.start();
    } else {
      alert('Голосовой ввод не поддерживается в вашем браузере');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceInput = (text: string) => {
    // Простой парсинг голосового ввода
    const lowerText = text.toLowerCase();
    
    // Определяем тип комнаты
    if (lowerText.includes('спальн')) setParams(prev => ({ ...prev, roomType: 'bedroom' }));
    else if (lowerText.includes('кухн')) setParams(prev => ({ ...prev, roomType: 'kitchen' }));
    else if (lowerText.includes('гостин')) setParams(prev => ({ ...prev, roomType: 'living' }));
    else if (lowerText.includes('ванн')) setParams(prev => ({ ...prev, roomType: 'bathroom' }));
    else if (lowerText.includes('офис')) setParams(prev => ({ ...prev, roomType: 'office' }));

    // Определяем стиль
    if (lowerText.includes('современн')) setParams(prev => ({ ...prev, style: 'modern' }));
    else if (lowerText.includes('классич')) setParams(prev => ({ ...prev, style: 'classic' }));
    else if (lowerText.includes('минималист')) setParams(prev => ({ ...prev, style: 'minimalist' }));

    // Извлекаем размеры
    const widthMatch = text.match(/(\d+)\s*(см|сантиметр|ширин)/i);
    const heightMatch = text.match(/(\d+)\s*(см|сантиметр|высот)/i);
    const depthMatch = text.match(/(\d+)\s*(см|сантиметр|глубин)/i);
    
    if (widthMatch) setParams(prev => ({ 
      ...prev, 
      dimensions: { ...prev.dimensions, width: widthMatch[1] }
    }));
    if (heightMatch) setParams(prev => ({ 
      ...prev, 
      dimensions: { ...prev.dimensions, height: heightMatch[1] }
    }));
    if (depthMatch) setParams(prev => ({ 
      ...prev, 
      dimensions: { ...prev.dimensions, depth: depthMatch[1] }
    }));

    // Извлекаем бюджет
    const budgetMatch = text.match(/(\d+)\s*(рубл|₽|тысяч)/i);
    if (budgetMatch) {
      let budget = parseInt(budgetMatch[1]);
      if (text.includes('тысяч')) budget *= 1000;
      setParams(prev => ({ ...prev, budget: budget.toString() }));
    }

    setChat(prev => [...prev, { role: 'user', text: `Голос: ${text}` }]);
  };

  // Отправка параметров на backend
  const handleSend = async () => {
    setAiState('loading');
    setChat((c) => [...c, { role: 'user', text: `Запрос: ${JSON.stringify(params)}` }]);
    
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
        setChat((c) => [...c, { role: 'ai', text: `Уточняющие вопросы:\n${data.data.questions.join('\n')}` }]);
      } else if (data.data?.model) {
        setModel(data.data.model);
        setAdvice(data.data.advice || []);
        setImageUrl(data.data.imageUrl || null);
        setAiState('result');
        setChat((c) => [...c, { role: 'ai', text: 'Готово! Параметры оптимизированы ИИ.' }]);
        
        // Применяем параметры от ИИ к форме
        if (data.data.model) {
          setParams(prev => ({
            ...prev,
            roomType: data.data.model.furnitureType || prev.roomType,
            style: data.data.model.material || prev.style,
            dimensions: {
              width: data.data.model.dimensions?.width?.toString() || prev.dimensions.width,
              height: data.data.model.dimensions?.height?.toString() || prev.dimensions.height,
              depth: data.data.model.dimensions?.depth?.toString() || prev.dimensions.depth,
            }
          }));
        }
      }
    } catch (e) {
      setChat((c) => [...c, { role: 'ai', text: 'Ошибка AI. Попробуйте позже.' }]);
      setAiState('idle');
    }
  };

  // Ответ на уточняющие вопросы
  const handleAnswer = (answers: string[]) => {
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
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI-ассистент по мебели
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 3D визуализация или изображение */}
            <div className="flex justify-center mb-4">
              {imageUrl ? (
                <img src={imageUrl} alt="AI visualization" className="rounded-lg w-64 h-64 object-contain bg-white transition-all duration-700 shadow-md" style={{ opacity: aiState === 'loading' ? 0.5 : 1 }} />
              ) : (
                <div className="w-64 h-64">
                  <Furniture3DViewer
                    width={Number(params.dimensions.width) || 100}
                    height={Number(params.dimensions.height) || 200}
                    depth={Number(params.dimensions.depth) || 40}
                    furnitureType={params.roomType || 'cabinet'}
                    material={params.style || 'oak'}
                    features={model?.features}
                  />
                </div>
              )}
            </div>

            {/* Голосовой ввод */}
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowVoiceInput(!showVoiceInput)}
                className="w-full mb-2"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Голосовой ввод
              </Button>
              
              {showVoiceInput && (
                <div className="space-y-2">
                  <Button 
                    onClick={isListening ? stopListening : startListening}
                    className={`w-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Остановить запись
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Начать запись
                      </>
                    )}
                  </Button>
                  
                  {transcript && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                      <strong>Распознано:</strong> {transcript}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Панель параметров */}
            <div className="space-y-2 mb-4">
              <Label>Тип комнаты</Label>
              <Input 
                value={params.roomType} 
                onChange={e => setParams({ ...params, roomType: e.target.value })} 
                placeholder="bedroom, kitchen..." 
              />
              
              <Label>Стиль</Label>
              <Input 
                value={params.style} 
                onChange={e => setParams({ ...params, style: e.target.value })} 
                placeholder="modern, classic..." 
              />
              
              <Label>Бюджет</Label>
              <Input 
                value={params.budget} 
                onChange={e => setParams({ ...params, budget: e.target.value })} 
                placeholder="50000" 
                type="number" 
              />
              
              <Label>Размеры (см)</Label>
              <div className="flex gap-2">
                <Input 
                  value={params.dimensions.width} 
                  onChange={e => setParams({ ...params, dimensions: { ...params.dimensions, width: e.target.value } })} 
                  placeholder="Ширина" 
                  type="number" 
                />
                <Input 
                  value={params.dimensions.height} 
                  onChange={e => setParams({ ...params, dimensions: { ...params.dimensions, height: e.target.value } })} 
                  placeholder="Высота" 
                  type="number" 
                />
                <Input 
                  value={params.dimensions.depth} 
                  onChange={e => setParams({ ...params, dimensions: { ...params.dimensions, depth: e.target.value } })} 
                  placeholder="Глубина" 
                  type="number" 
                />
              </div>
              
              <Label>Особые требования</Label>
              <Input 
                value={params.requirements} 
                onChange={e => setParams({ ...params, requirements: e.target.value })} 
                placeholder="угловой, белый цвет..." 
              />
            </div>

            {/* Кнопка отправки */}
            <Button 
              className="w-full" 
              onClick={handleSend} 
              disabled={aiState === 'loading'}
            >
              {aiState === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI думает...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Запросить у AI
                </>
              )}
            </Button>

            {/* Ответы AI */}
            <div className="mt-4 space-y-2">
              {aiState === 'questions' && questions.length > 0 && (
                <form onSubmit={e => { e.preventDefault(); handleAnswer(answers); }} className="space-y-2">
                  <div className="mb-2 font-semibold">AI уточняет:</div>
                  {questions.map((q, i) => (
                    <Input 
                      key={i} 
                      value={answers[i] || ''} 
                      onChange={e => {
                        const arr = [...answers]; 
                        arr[i] = e.target.value; 
                        setAnswers(arr);
                      }} 
                      placeholder={q} 
                    />
                  ))}
                  <Button type="submit" className="w-full mt-2">Ответить</Button>
                </form>
              )}
              
              {aiState === 'result' && (
                <div>
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Советы по сборке:
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-200 space-y-1">
                    {advice.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                  
                  {model && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-semibold text-sm mb-2">Параметры от ИИ:</div>
                      <div className="text-xs space-y-1">
                        <div>Тип: {model.furnitureType}</div>
                        <div>Материал: {model.material}</div>
                        <div>Размеры: {model.dimensions?.width}×{model.dimensions?.height}×{model.dimensions?.depth}см</div>
                        {model.features && (
                          <div>
                            Полки: {model.features.shelves}, Двери: {model.features.doors}, Ящики: {model.features.drawers}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Чат-история */}
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
          <Button variant="outline" className="flex-1 flex items-center gap-2" disabled>
            <Download className="h-4 w-4" />
            Экспорт
          </Button>
          <Button variant="outline" className="flex-1 flex items-center gap-2" disabled>
            <Save className="h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
} 