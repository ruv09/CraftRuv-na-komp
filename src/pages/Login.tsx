import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🪑</div>
          <h1 className="text-2xl font-bold text-white">CraftRuv</h1>
          <p className="text-blue-200 mt-2">Войдите в свой аккаунт</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Вход в систему</CardTitle>
            <CardDescription className="text-blue-200">
              Введите ваши данные для входа
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Пароль
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-blue-900 hover:bg-gray-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  'Войти'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-200 text-sm">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-white hover:underline">
                  Зарегистрироваться
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-blue-200 hover:text-white text-sm">
                Забыли пароль?
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm">
            Продолжая, вы соглашаетесь с{' '}
            <Link to="/terms" className="text-white hover:underline">
              Условиями использования
            </Link>{' '}
            и{' '}
            <Link to="/privacy" className="text-white hover:underline">
              Политикой конфиденциальности
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 