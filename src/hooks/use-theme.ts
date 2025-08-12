import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Если тема сохранена, используем её
    if (savedTheme) {
      return savedTheme;
    }
    
    // Проверяем системные предпочтения
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // По умолчанию используем светлую тему
    return 'light';
  });

  // Эффект для применения темы к документу
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    let appliedTheme = theme;
    
    // Если выбрана системная тема, определяем её
    if (theme === 'system') {
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    root.classList.add(appliedTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Функция для установки темы
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
}