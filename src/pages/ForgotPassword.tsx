import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Пожалуйста, введите email');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Если аккаунт с таким email существует, ссылка для сброса пароля была отправлена.');
      } else {
        toast.error(data.error || 'Ошибка при отправке запроса');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Ошибка сети. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-white text-xl">Проверьте ваш email</CardTitle>
              <CardDescription className="text-blue-200">
                Если аккаунт с email <strong>{email}</strong> существует, мы отправили ссылку для сброса пароля.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-blue-200 text-sm">
                <p>Не получили письмо? Проверьте папку "Спам" или попробуйте еще раз.</p>
              </div>
              
              <Button
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-white text-blue-900 hover:bg-gray-100"
              >
                Отправить еще раз
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-blue-200 hover:text-white text-sm flex items-center justify-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Вернуться к входу
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Забыли пароль?</CardTitle>
            <CardDescription className="text-blue-200">
              Введите ваш email, и мы отправим ссылку для сброса пароля
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-blue-900 hover:bg-gray-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Отправить ссылку'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-200 hover:text-white text-sm flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к входу
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword; 