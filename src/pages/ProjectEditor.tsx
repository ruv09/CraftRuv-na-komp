import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const ProjectEditor: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Редактор проектов</CardTitle>
          <CardDescription>
            Создание и редактирование проектов мебели
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Функция в разработке...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectEditor; 