import { useState } from 'react';
import { ImageData } from '../types';

export const useEditor = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false);

  const handleAddImage = (uri: string) => {
    const newImage: ImageData = {
      id: Date.now().toString(),
      uri,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 200 }
    };
    setImages([...images, newImage]);
  };

  const handleUpdateImage = (id: string, updates: Partial<ImageData>) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  };

  return {
    images,
    selectedImageId,
    isSelected,
    handleAddImage,
    handleUpdateImage,
    setSelectedImageId,
    setIsSelected
  };
}; 