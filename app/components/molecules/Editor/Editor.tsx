import React, {useRef, useEffect} from 'react';
import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  BackHandler,
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

  const containerWidth = animatedSize.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  const containerHeight = animatedSize.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  const handlePress = () => {
    setSelectedImageId(null);
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress}>
      <Animated.View
        style={{
          width: containerWidth,
          height: containerHeight,
          backgroundColor: 'black',
          borderRadius: 10,
          borderWidth: isZoomed ? 0 : 1,
          borderColor: '#555',
          justifyContent: 'space-between',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
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

export default Editor;
