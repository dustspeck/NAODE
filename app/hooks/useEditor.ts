import {useState, useCallback} from 'react';
import {ElementData, ImageData, TextData} from '../types';
import {DEFAULT_FONT_SIZE} from '../constants/ui';
import {cleanupImage} from '../utils/imageCleanup';

export const useEditor = () => {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );

  const updateElements = useCallback((elements: ElementData[]) => {
    setElements(elements);
  }, []);

  const handleAddImage = useCallback(
    (uri: string) => {
      const newElement: ImageData = {
        id: Date.now().toString(),
        uri,
        position: {x: 0, y: 0},
        size: {width: 200, height: 200},
        aspectRatio: 1,
        zIndex: elements.length,
        rotation: 0,
        name: `${elements.length + 1} Image`,
        type: 'image',
        borderRadius: 0,
        opacity: 1,
      };
      setElements(prevElements => [...prevElements, newElement]);
    },
    [elements.length],
  );

  const handleAddText = useCallback(
    (text: string) => {
      const newElement: TextData = {
        id: Date.now().toString(),
        text,
        position: {x: 0, y: 0},
        size: {width: 200, height: 200},
        fontSize: DEFAULT_FONT_SIZE,
        fontWeight: 'normal' as 'normal' | 'bold',
        fontFamily: 'RobotoRegular',
        color: '#ffffff',
        zIndex: elements.length,
        rotation: 0,
        name: `${elements.length + 1} Text`,
        type: 'text',
      };
      setElements(prevElements => [...prevElements, newElement]);
    },
    [elements.length],
  );

  const handleUpdateImage = useCallback(
    (id: string, updates: Partial<ImageData>) => {
      setElements(
        prevElements =>
          prevElements.map(element =>
            element.id === id ? {...element, ...updates} : element,
          ) as ElementData[],
      );
    },
    [],
  );

  const handleUpdateText = useCallback(
    (id: string, updates: Partial<TextData>) => {
      setElements(
        prevElements =>
          prevElements.map(element =>
            element.id === id ? {...element, ...updates} : element,
          ) as ElementData[],
      );
    },
    [],
  );

  const handleDeleteElement = useCallback(
    (id: string) => {
      // Find the element being deleted before state update
      const deletedElement = elements.find(element => element.id === id);
      
      // If it's an image element, clean up its file
      if (deletedElement?.type === 'image') {
        cleanupImage(deletedElement.uri);
      }
      
      // Update state after cleanup
      setElements(prevElements => prevElements.filter(element => element.id !== id));
      
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
    },
    [selectedElementId, elements],
  );

  const bringToFront = useCallback((id: string) => {
    setElements(prevElements => {
      const maxZIndex = Math.max(
        ...prevElements.map(element => element.zIndex),
      );
      return prevElements.map(element =>
        element.id === id ? {...element, zIndex: maxZIndex + 1} : element,
      );
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setElements(prevElements => {
      const minZIndex = Math.min(
        ...prevElements.map(element => element.zIndex),
      );
      return prevElements.map(element =>
        element.id === id ? {...element, zIndex: minZIndex - 1} : element,
      );
    });
  }, []);

  const moveLayerUp = useCallback((id: string) => {
    setElements(prevElements => {
      const currentElement = prevElements.find(element => element.id === id);
      if (!currentElement) return prevElements;

      const nextElement = prevElements
        .filter(element => element.zIndex > currentElement.zIndex)
        .sort((a, b) => a.zIndex - b.zIndex)[0];

      if (!nextElement) return prevElements;

      return prevElements.map(element => {
        if (element.id === id) {
          return {
            ...element,
            zIndex: nextElement.zIndex,
          };
        }
        if (element.id === nextElement.id) {
          return {
            ...element,
            zIndex: currentElement.zIndex,
          };
        }
        return element;
      });
    });
  }, []);

  const moveLayerDown = useCallback((id: string) => {
    setElements(prevElements => {
      const currentElement = prevElements.find(element => element.id === id);
      if (!currentElement) return prevElements;

      const prevElement = prevElements
        .filter(element => element.zIndex < currentElement.zIndex)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

      if (!prevElement) return prevElements;

      return prevElements.map(element => {
        if (element.id === id) {
          return {
            ...element,
            zIndex: prevElement.zIndex,
          };
        }
        if (element.id === prevElement.id) {
          return {
            ...element,
            zIndex: currentElement.zIndex,
          };
        }
        return element;
      });
    });
  }, []);

  return {
    elements,
    updateElements,
    selectedElementId,
    handleAddImage,
    handleUpdateImage,
    handleDeleteElement,
    setSelectedElementId,
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
    handleAddText,
    handleUpdateText,
  };
};
