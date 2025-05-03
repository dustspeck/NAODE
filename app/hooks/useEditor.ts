import {useState, useCallback} from 'react';
import {ImageData} from '../types';

export const useEditor = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleAddImage = useCallback((uri: string) => {
    const newImage: ImageData = {
      id: Date.now().toString(),
      uri,
      position: {x: 0, y: 0},
      size: {width: 200, height: 200},
    };
    setImages(prevImages => [...prevImages, newImage]);
  }, []);

  const handleUpdateImage = useCallback((id: string, updates: Partial<ImageData>) => {
    setImages(prevImages => 
      prevImages.map(img => (img.id === id ? {...img, ...updates} : img))
    );
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImages(prevImages => prevImages.filter(img => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  }, [selectedImageId]);

  return {
    images,
    selectedImageId,
    handleAddImage,
    handleUpdateImage,
    handleDeleteImage,
    setSelectedImageId,
  };
};
