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
}

const Editor: React.FC<EditorProps> = ({
  animatedSize,
  isZoomed,
  setIsZoomed,
}) => {
  const {
    images,
    selectedImageId,
    setSelectedImageId,
    handleUpdateImage,
    handleDeleteImage,
  } = useEditorContext();
  const {width, height} = useWindowDimensions();
  const panValues = useRef<{[key: string]: Animated.ValueXY}>({}).current;

  // Clean up panValues when images are deleted
  useEffect(() => {
    const currentImageIds = new Set(images.map(img => img.id));
    Object.keys(panValues).forEach(id => {
      if (!currentImageIds.has(id)) {
        delete panValues[id];
      }
    });
  }, [images, panValues]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isZoomed) {
          setIsZoomed(false);
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
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

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress}>
      <Animated.View style={containerStyle}>
        {isZoomed && (
          <ZoomOutIcon isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
        )}
        {images.map(image => (
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
        ))}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default React.memo(Editor);
