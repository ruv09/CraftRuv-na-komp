import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Profile: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
          <CardDescription>
            Управление профилем и настройками
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Функция в разработке...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 