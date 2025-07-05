import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Настройки</CardTitle>
          <CardDescription>
            Настройки приложения и аккаунта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Функция в разработке...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings; 