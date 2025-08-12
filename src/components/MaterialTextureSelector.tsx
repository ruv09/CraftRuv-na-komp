import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import MaterialSelector from './MaterialSelector';
import TextureManager from './TextureManager';
import Furniture3DViewer from './Furniture3DViewer';

interface Texture {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadDate: string;
  category?: string;
  tags?: string[];
}

interface MaterialTextureSelectorProps {
  initialMaterial?: string;
  initialTextureUrl?: string;
  furnitureType: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  features?: {
    shelves: number;
    doors: number;
    drawers: number;
  };
  onMaterialChange?: (materialId: string) => void;
  onTextureChange?: (textureUrl: string) => void;
  onDimensionsChange?: (dimensions: { width: number; height: number; depth: number }) => void;
}

const MaterialTextureSelector: React.FC<MaterialTextureSelectorProps> = ({
  initialMaterial = 'oak',
  initialTextureUrl,
  furnitureType = 'cabinet',
  dimensions = { width: 80, height: 200, depth: 60 },
  features = { shelves: 3, doors: 2, drawers: 0 },
  onMaterialChange,
  onTextureChange,
  onDimensionsChange
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial);
  const [selectedTextureUrl, setSelectedTextureUrl] = useState<string | undefined>(initialTextureUrl);
  const [activeTab, setActiveTab] = useState('preview');

  // Обработчик изменения материала
  const handleMaterialChange = (materialId: string) => {
    setSelectedMaterial(materialId);
    if (onMaterialChange) {
      onMaterialChange(materialId);
    }
  };

  // Обработчик изменения текстуры
  const handleTextureChange = (textureUrl: string) => {
    setSelectedTextureUrl(textureUrl);
    if (onTextureChange) {
      onTextureChange(textureUrl);
    }
  };

  // Обработчик выбора текстуры из менеджера текстур
  const handleSelectTexture = (texture: Texture) => {
    setSelectedTextureUrl(texture.url);
    if (onTextureChange) {
      onTextureChange(texture.url);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      <div className="md:col-span-2 h-[500px] md:h-full">
        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">3D Предпросмотр</TabsTrigger>
                <TabsTrigger value="textures">Текстуры</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="h-[calc(100%-40px)]">
                <Furniture3DViewer
                  width={dimensions.width}
                  height={dimensions.height}
                  depth={dimensions.depth}
                  furnitureType={furnitureType}
                  material={selectedMaterial}
                  textureUrl={selectedTextureUrl}
                  features={features}
                  onDimensionsChange={onDimensionsChange}
                />
              </TabsContent>
              
              <TabsContent value="textures" className="h-[calc(100%-40px)] overflow-auto">
                <TextureManager
                  isAdmin={false}
                  onSelectTexture={handleSelectTexture}
                  selectedTextureId={selectedTextureUrl}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <MaterialSelector
          selectedMaterial={selectedMaterial}
          onMaterialChange={handleMaterialChange}
          onTextureChange={handleTextureChange}
        />
      </div>
    </div>
  );
};

export default MaterialTextureSelector;