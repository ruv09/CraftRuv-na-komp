import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Furniture3DViewerProps {
  width: number;
  height: number;
  depth: number;
  furnitureType: string;
  material: string;
  onDimensionsChange?: (dimensions: { width: number; height: number; depth: number }) => void;
}

interface FurniturePieceProps {
  width: number;
  height: number;
  depth: number;
  furnitureType: string;
  material: string;
}

const FurniturePiece: React.FC<FurniturePieceProps> = ({ width, height, depth, furnitureType, material }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Определяем цвет материала
  const getMaterialColor = (material: string) => {
    const colors = {
      oak: '#8B4513',
      pine: '#DEB887',
      birch: '#F5DEB3',
      laminate_white: '#FFFFFF',
      laminate_oak: '#D2691E',
      veneer_oak: '#CD853F',
      mdf_white: '#F8F8FF',
      mdf_colored: '#DDA0DD',
    };
    return colors[material as keyof typeof colors] || '#8B4513';
  };

  // Определяем текстуру материала
  const getMaterialTexture = (material: string) => {
    const textures = {
      oak: 'wood',
      pine: 'wood',
      birch: 'wood',
      laminate_white: 'smooth',
      laminate_oak: 'wood',
      veneer_oak: 'wood',
      mdf_white: 'smooth',
      mdf_colored: 'smooth',
    };
    return textures[material as keyof typeof textures] || 'smooth';
  };

  const color = getMaterialColor(material);
  const texture = getMaterialTexture(material);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      {/* Основной корпус */}
      <Box
        ref={meshRef}
        args={[width / 100, height / 100, depth / 100]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color}
          roughness={texture === 'wood' ? 0.8 : 0.3}
          metalness={texture === 'smooth' ? 0.1 : 0}
        />
      </Box>

      {/* Дверцы для шкафов */}
      {(furnitureType === 'cabinet' || furnitureType === 'wardrobe') && (
        <>
          <Box
            position={[width / 200, 0, depth / 200 + 0.01]}
            args={[width / 200, height / 100, 0.02]}
          >
            <meshStandardMaterial color="#8B7355" />
          </Box>
          <Box
            position={[-width / 200, 0, depth / 200 + 0.01]}
            args={[width / 200, height / 100, 0.02]}
          >
            <meshStandardMaterial color="#8B7355" />
          </Box>
        </>
      )}

      {/* Полки для книжных шкафов */}
      {furnitureType === 'bookshelf' && (
        <>
          {Array.from({ length: Math.floor(height / 50) }, (_, i) => (
            <Box
              key={i}
              position={[0, (i + 1) * height / (Math.floor(height / 50) + 1) / 100 - height / 200, 0]}
              args={[width / 100, 0.02, depth / 100]}
            >
              <meshStandardMaterial color="#8B7355" />
            </Box>
          ))}
        </>
      )}

      {/* Ручки для шкафов */}
      {(furnitureType === 'cabinet' || furnitureType === 'wardrobe') && (
        <>
          <Box
            position={[width / 200, 0, depth / 200 + 0.03]}
            args={[0.02, 0.1, 0.02]}
          >
            <meshStandardMaterial color="#FFD700" metalness={0.8} />
          </Box>
          <Box
            position={[-width / 200, 0, depth / 200 + 0.03]}
            args={[0.02, 0.1, 0.02]}
          >
            <meshStandardMaterial color="#FFD700" metalness={0.8} />
          </Box>
        </>
      )}

      {/* Размеры */}
      <Html position={[0, height / 100 + 0.1, 0]} center>
        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
          {width}×{height}×{depth} см
        </div>
      </Html>
    </group>
  );
};

const Furniture3DViewer: React.FC<Furniture3DViewerProps> = ({ 
  width, 
  height, 
  depth, 
  furnitureType, 
  material,
  onDimensionsChange 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="w-full h-96 border rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
      >
        {/* Освещение */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Пол */}
        <Box position={[0, -height / 100 - 0.1, 0]} args={[10, 0.1, 10]}>
          <meshStandardMaterial color="#8FBC8F" />
        </Box>

        {/* Мебель */}
        <FurniturePiece
          width={width}
          height={height}
          depth={depth}
          furnitureType={furnitureType}
          material={material}
        />

        {/* Управление камерой */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
        />

        {/* Информационная панель */}
        <Html position={[-2, 1.5, 0]}>
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
            <h3 className="font-bold text-sm mb-2">Параметры мебели</h3>
            <div className="text-xs space-y-1">
              <div>Ширина: {width} см</div>
              <div>Высота: {height} см</div>
              <div>Глубина: {depth} см</div>
              <div>Тип: {furnitureType}</div>
              <div>Материал: {material}</div>
            </div>
          </div>
        </Html>
      </Canvas>

      {/* Элементы управления */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        <div className="text-xs font-medium mb-2">Управление:</div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Вращение: перетащите мышью</div>
          <div>• Масштаб: колесо мыши</div>
          <div>• Перемещение: Shift + перетащите</div>
        </div>
      </div>
    </div>
  );
};

export default Furniture3DViewer; 