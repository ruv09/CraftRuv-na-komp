import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface FurniturePieceProps {
  width: number;
  height: number;
  depth: number;
  furnitureType: string;
  material: string;
  features?: {
    shelves: number;
    doors: number;
    drawers: number;
  };
}

const FurniturePiece: React.FC<FurniturePieceProps> = ({ 
  width, 
  height, 
  depth, 
  furnitureType, 
  material,
  features = { shelves: 3, doors: 2, drawers: 0 }
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Материалы с цветами
  const materialColors = {
    oak: '#8B4513',
    pine: '#DEB887',
    birch: '#F5DEB3',
    laminate_white: '#FFFFFF',
    laminate_oak: '#8B4513',
    veneer_oak: '#8B4513',
    mdf_white: '#FFFFFF',
    mdf_colored: '#F0F0F0'
  };

  const color = materialColors[material as keyof typeof materialColors] || '#8B4513';

  // Масштабирование для 3D (делим на 100 для перевода см в метры)
  const scale = 0.01;
  const w = width * scale;
  const h = height * scale;
  const d = depth * scale;

  return (
    <group>
      {/* Основной корпус */}
      <Box 
        ref={meshRef}
        args={[w, h, d]} 
        position={[0, h/2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color} 
          roughness={0.8}
          metalness={0.1}
          opacity={hovered ? 0.8 : 1}
          transparent
        />
      </Box>

      {/* Полки */}
      {features.shelves > 0 && furnitureType !== 'table' && (
        <group>
          {Array.from({ length: features.shelves }, (_, i) => {
            const shelfHeight = (h / (features.shelves + 1)) * (i + 1);
            return (
              <Box
                key={`shelf-${i}`}
                args={[w * 0.9, 0.02, d * 0.8]}
                position={[0, shelfHeight, 0]}
              >
                <meshStandardMaterial color={color} roughness={0.6} />
              </Box>
            );
          })}
        </group>
      )}

      {/* Двери */}
      {features.doors > 0 && furnitureType !== 'table' && (
        <group>
          {Array.from({ length: features.doors }, (_, i) => {
            const doorWidth = w / features.doors;
            const doorX = (i - (features.doors - 1) / 2) * doorWidth;
            return (
              <Box
                key={`door-${i}`}
                args={[doorWidth * 0.9, h * 0.95, 0.02]}
                position={[doorX, h/2, d/2 + 0.01]}
              >
                <meshStandardMaterial color={color} roughness={0.4} />
              </Box>
            );
          })}
        </group>
      )}

      {/* Ящики */}
      {features.drawers > 0 && furnitureType !== 'table' && (
        <group>
          {Array.from({ length: features.drawers }, (_, i) => {
            const drawerHeight = 0.1;
            const drawerSpacing = 0.05;
            const totalDrawerHeight = features.drawers * drawerHeight + (features.drawers - 1) * drawerSpacing;
            const startY = h - totalDrawerHeight - 0.1;
            const drawerY = startY + i * (drawerHeight + drawerSpacing) + drawerHeight/2;
            
            return (
              <group key={`drawer-${i}`}>
                {/* Ящик */}
                <Box
                  args={[w * 0.8, drawerHeight, d * 0.7]}
                  position={[0, drawerY, d/2 + 0.05]}
                >
                  <meshStandardMaterial color={color} roughness={0.6} />
                </Box>
                {/* Ручка ящика */}
                <Cylinder
                  args={[0.02, 0.02, 0.08]}
                  position={[0, drawerY, d/2 + 0.1]}
                  rotation={[Math.PI/2, 0, 0]}
                >
                  <meshStandardMaterial color="#333" metalness={0.8} />
                </Cylinder>
              </group>
            );
          })}
        </group>
      )}

      {/* Ножки для стола */}
      {furnitureType === 'table' && (
        <group>
          {Array.from({ length: 4 }, (_, i) => {
            const legX = (i % 2 === 0 ? -1 : 1) * (w/2 - 0.05);
            const legZ = (i < 2 ? -1 : 1) * (d/2 - 0.05);
            return (
              <Cylinder
                key={`leg-${i}`}
                args={[0.03, 0.03, 0.75]}
                position={[legX, 0.375, legZ]}
              >
                <meshStandardMaterial color={color} roughness={0.8} />
              </Cylinder>
            );
          })}
        </group>
      )}

      {/* Штанга для одежды (для гардероба) */}
      {furnitureType === 'wardrobe' && (
        <Cylinder
          args={[0.02, 0.02, w * 0.8]}
          position={[0, h * 0.7, 0]}
          rotation={[0, 0, Math.PI/2]}
        >
          <meshStandardMaterial color="#666" metalness={0.9} />
        </Cylinder>
      )}

      {/* Размеры */}
      <Text
        position={[w/2 + 0.2, h/2, 0]}
        fontSize={0.05}
        color="black"
        anchorX="left"
      >
        {width}×{height}×{depth}см
      </Text>
    </group>
  );
};

interface Furniture3DViewerProps {
  width: number;
  height: number;
  depth: number;
  furnitureType: string;
  material: string;
  features?: {
    shelves: number;
    doors: number;
    drawers: number;
  };
  onDimensionsChange?: (dimensions: { width: number; height: number; depth: number }) => void;
}

const Furniture3DViewer: React.FC<Furniture3DViewerProps> = ({ 
  width, 
  height, 
  depth, 
  furnitureType, 
  material,
  features,
  onDimensionsChange 
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        style={{ height: '100%' }}
      >
        {/* Освещение */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Мебель */}
        <FurniturePiece
          width={width}
          height={height}
          depth={depth}
          furnitureType={furnitureType}
          material={material}
          features={features}
        />

        {/* Управление камерой */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
        />

        {/* Сетка для ориентации */}
        <gridHelper args={[10, 10]} />
      </Canvas>

      {/* Информационная панель */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <div>Тип: {furnitureType}</div>
          <div>Материал: {material}</div>
          <div>Размеры: {width}×{height}×{depth} см</div>
          {features && (
            <div className="mt-1">
              <div>Полки: {features.shelves}</div>
              <div>Двери: {features.doors}</div>
              <div>Ящики: {features.drawers}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Furniture3DViewer; 