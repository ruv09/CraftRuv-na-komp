import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['Слабый', 'Слабый', 'Средний', 'Хороший', 'Сильный', 'Очень сильный'];
    const colors = ['text-red-500', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-500', 'text-green-600'];
    
    return {
      score: Math.min(score, 5),
      label: labels[Math.min(score, 5)],
      color: colors[Math.min(score, 5)]
    };
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🪑</div>
          <h1 className="text-2xl font-bold text-white">CraftRuv</h1>
          <p className="text-blue-200 mt-2">Создайте новый аккаунт</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Регистрация</CardTitle>
            <CardDescription className="text-blue-200">
              Заполните форму для создания аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Имя
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ваше имя"
                  required
                  className={`bg-white/10 border-white/20 text-white placeholder:text-blue-200 ${
                    errors.name ? 'border-red-400' : ''
                  }`}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className={`bg-white/10 border-white/20 text-white placeholder:text-blue-200 ${
                    errors.email ? 'border-red-400' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Пароль
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Создайте пароль"
                    required
                    className={`bg-white/10 border-white/20 text-white placeholder:text-blue-200 pr-10 ${
                      errors.password ? 'border-red-400' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`${strength.color}`}>{strength.label}</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full ${
                            level <= strength.score ? strength.color.replace('text-', 'bg-') : 'bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Подтвердите пароль
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Повторите пароль"
                    required
                    className={`bg-white/10 border-white/20 text-white placeholder:text-blue-200 pr-10 ${
                      errors.confirmPassword ? 'border-red-400' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-blue-900 hover:bg-gray-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Создать аккаунт
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-200 text-sm">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-white hover:underline">
                  Войти
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm">
            Регистрируясь, вы соглашаетесь с{' '}
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

export default Register; 