import React, {useRef, useEffect, useMemo, useCallback} from 'react';
import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  BackHandler,
  ViewStyle,
} from 'react-native';
import ZoomOutIcon from '../../atoms/ZoomOutIcon';
import {useEditorContext} from '../../../context/EditorContext';
import CustomImage from '../Assets/CustomImage';

interface EditorProps {
  animatedSize: Animated.Value;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
  panValues: {[key: string]: Animated.ValueXY};
}

const Editor: React.FC<EditorProps> = React.memo(({
  animatedSize,
  isZoomed,
  setIsZoomed,
  panValues,
}) => {
  const {
    images,
    selectedImageId,
    setSelectedImageId,
    handleUpdateImage,
    handleDeleteImage,
  } = useEditorContext();
  const {width, height} = useWindowDimensions();
  const backHandlerRef = useRef<{remove: () => void} | null>(null);

  // Clean up panValues when images are deleted
  useEffect(() => {
    const currentImageIds = new Set(images.map(img => img.id));
    const keysToDelete = Object.keys(panValues).filter(id => !currentImageIds.has(id));
    
    if (keysToDelete.length > 0) {
      keysToDelete.forEach(id => {
        delete panValues[id];
      });
    }
  }, [images, panValues]);

  useEffect(() => {
    if (backHandlerRef.current) {
      backHandlerRef.current.remove();
    }

    backHandlerRef.current = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isZoomed) {
          setIsZoomed(false);
          return true;
        }
        return false;
      },
    );

    return () => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
    };
  }, [isZoomed, setIsZoomed]);

  const containerStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(() => ({
    width: animatedSize.interpolate({
      inputRange: [0, 1],
      outputRange: [0, width],
    }),
    height: animatedSize.interpolate({
      inputRange: [0, 1],
      outputRange: [0, height],
    }),
    backgroundColor: 'black',
    borderRadius: 10,
    borderWidth: isZoomed ? 0 : 1,
    borderColor: '#555',
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    overflow: 'hidden',
  }), [animatedSize, width, height, isZoomed]);

  const handlePress = useCallback(() => {
    setSelectedImageId(null);
  }, [setSelectedImageId]);

  const renderImages = useCallback(() => {
    return images.map(image => (
      <CustomImage
        key={image.id}
        image={image}
        isSelected={selectedImageId === image.id}
        isZoomed={isZoomed}
        animatedSize={animatedSize}
        panValues={panValues}
        onSelect={setSelectedImageId}
        onUpdate={handleUpdateImage}
        onDelete={handleDeleteImage}
      />
    ));
  }, [images, selectedImageId, isZoomed, animatedSize, panValues, setSelectedImageId, handleUpdateImage, handleDeleteImage]);

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress}>
      <Animated.View style={containerStyle}>
        {isZoomed && (
          <ZoomOutIcon isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
        )}
        {renderImages()}
      </Animated.View>
    </TouchableOpacity>
  );
});

Editor.displayName = 'Editor';

export default Editor;
