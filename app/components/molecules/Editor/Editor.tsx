import React, {useRef, useEffect, useState} from 'react';
import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  PanResponder,
  BackHandler,
  View,
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import ZoomOutIcon from '../../atoms/ZoomOutIcon';
import Icon from 'react-native-vector-icons/Ionicons';
import { useEditorContext } from '../../../context/EditorContext';

interface ImageData {
  id: string;
  uri: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface EditorProps {
  animatedSize: Animated.Value;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
}

const Editor: React.FC<EditorProps> = ({ animatedSize, isZoomed, setIsZoomed }) => {
  const {
    images,
    selectedImageId,
    setSelectedImageId,
    isSelected,
    setIsSelected,
    handleAddImage,
    handleUpdateImage
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

  const createPanResponder = (imageId: string) => {
    if (!panValues[imageId]) {
      panValues[imageId] = new Animated.ValueXY();
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dx: panValues[imageId].x, dy: panValues[imageId].y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 2 && Math.abs(gestureState.dy) < 2) {
          setSelectedImageId(imageId);
          setIsSelected(!isSelected);
        }
        panValues[imageId].extractOffset();
        handleUpdateImage(imageId, {
          position: {
            x: gestureState.moveX,
            y: gestureState.moveY,
          },
        });
      },
    });
  };

  const createResizeResponder = (imageId: string) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const image = images.find(img => img.id === imageId);
        if (image) {
          const newWidth = Math.max(50, image.size.width + gestureState.dx);
          const newHeight = Math.max(50, image.size.height + gestureState.dy);
          handleUpdateImage(imageId, {
            size: { width: newWidth, height: newHeight },
          });
        }
      },
    });
  };

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
    setIsSelected(false);
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
        {images.map((image) => {
          const panResponder = createPanResponder(image.id);
          const resizeResponder = createResizeResponder(image.id);
          const isImageSelected = selectedImageId === image.id;

          return (
            <Animated.View
              key={image.id}
              {...panResponder.panHandlers}
              style={{
                transform: [
                  {translateX: Animated.multiply(animatedSize, panValues[image.id]?.x || 0)},
                  {translateY: Animated.multiply(animatedSize, panValues[image.id]?.y || 0)},
                ],
                width: animatedSize.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, image.size.width],
                }),
                height: animatedSize.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, image.size.height],
                }),
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginLeft: animatedSize.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -image.size.width / 2],
                }),
                marginTop: animatedSize.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -image.size.height / 2],
                }),
              }}>
              <Image
                source={{uri: image.uri}}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'stretch',
                }}
              />
              {isImageSelected && !isZoomed && (
                <>
                  <View
                    style={{
                      position: 'absolute',
                      top: -1,
                      left: -1,
                      right: -1,
                      bottom: -1,
                      borderWidth: 1,
                      borderColor: '#eee',
                      borderRadius: 0,
                    }}
                  />
                  <View
                    {...resizeResponder.panHandlers}
                    style={{
                      position: 'absolute',
                      right: -10,
                      bottom: -10,
                      width: 30,
                      height: 30,
                      backgroundColor: '#eee',
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="resize" style={{transform: [{rotate: '90deg'}]}} size={20} color="black" />
                  </View>
                </>
              )}
            </Animated.View>
          );
        })}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Editor;
