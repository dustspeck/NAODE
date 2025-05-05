import {useState, useCallback} from 'react';
import {ImageData} from '../types';

export const useEditor = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleAddImage = useCallback(
    (uri: string) => {
      const newImage: ImageData = {
        id: Date.now().toString(),
        uri,
        position: {x: 0, y: 0},
        size: {width: 200, height: 200},
        zIndex: images.length,
        rotation: 0,
        name: `Layer ${images.length + 1}`,
      };
      setImages(prevImages => [...prevImages, newImage]);
    },
    [images.length],
  );

  const handleUpdateImage = useCallback(
    (id: string, updates: Partial<ImageData>) => {
      setImages(prevImages =>
        prevImages.map(img => (img.id === id ? {...img, ...updates} : img)),
      );
    },
    [],
  );

  const handleDeleteImage = useCallback(
    (id: string) => {
      setImages(prevImages => prevImages.filter(img => img.id !== id));
      if (selectedImageId === id) {
        setSelectedImageId(null);
      }
    },
    [selectedImageId],
  );

  const bringToFront = useCallback((id: string) => {
    setImages(prevImages => {
      const maxZIndex = Math.max(...prevImages.map(img => img.zIndex));
      return prevImages.map(img =>
        img.id === id ? {...img, zIndex: maxZIndex + 1} : img,
      );
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setImages(prevImages => {
      const minZIndex = Math.min(...prevImages.map(img => img.zIndex));
      return prevImages.map(img =>
        img.id === id ? {...img, zIndex: minZIndex - 1} : img,
      );
    });
  }, []);

  const moveLayerUp = useCallback((id: string) => {
    setImages(prevImages => {
      const currentImage = prevImages.find(img => img.id === id);
      if (!currentImage) return prevImages;

      const nextImage = prevImages
        .filter(img => img.zIndex > currentImage.zIndex)
        .sort((a, b) => a.zIndex - b.zIndex)[0];

      if (!nextImage) return prevImages;

      return prevImages.map(img => {
        if (img.id === id) {
          return {
            ...img,
            zIndex: nextImage.zIndex,
          };
        }
        if (img.id === nextImage.id) {
          return {
            ...img,
            zIndex: currentImage.zIndex,
          };
        }
        return img;
      });
    });
  }, []);

  const moveLayerDown = useCallback((id: string) => {
    setImages(prevImages => {
      const currentImage = prevImages.find(img => img.id === id);
      if (!currentImage) return prevImages;

      const prevImage = prevImages
        .filter(img => img.zIndex < currentImage.zIndex)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

      if (!prevImage) return prevImages;

      return prevImages.map(img => {
        if (img.id === id) {
          return {
            ...img,
            zIndex: prevImage.zIndex,
          };
        }
        if (img.id === prevImage.id) {
          return {
            ...img,
            zIndex: currentImage.zIndex,
          };
        }
        return img;
      });
    });
  }, []);

  return {
    images,
    selectedImageId,
    handleAddImage,
    handleUpdateImage,
    handleDeleteImage,
    setSelectedImageId,
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
  };
};
