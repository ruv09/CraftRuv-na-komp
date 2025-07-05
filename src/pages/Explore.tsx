import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Explore: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Исследовать проекты</CardTitle>
          <CardDescription>
            Просмотр проектов других пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Функция в разработке...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Explore; 