import React, {useEffect, useMemo, useCallback} from 'react';
import {
  Animated,
  PanResponder,
  View,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ImageData} from '../../../types';

interface CustomImageProps {
  image: ImageData;
  isSelected: boolean;
  isZoomed: boolean;
  animatedSize: Animated.Value;
  panValues: {[key: string]: Animated.ValueXY};
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ImageData>) => void;
  onDelete: (id: string) => void;
}

const CustomImage: React.FC<CustomImageProps> = ({
  image,
  isSelected,
  isZoomed,
  animatedSize,
  panValues,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const {width, height} = useWindowDimensions();

  useEffect(() => {
    let isMounted = true;
    
    // Get the actual image dimensions when it loads
    Image.getSize(image.uri, (imgWidth, imgHeight) => {
      if (!isMounted) return;
      
      // Calculate the aspect ratio
      const aspectRatio = imgWidth / imgHeight;
      
      // Set a reasonable initial size while maintaining aspect ratio
      const initialWidth = Math.min(200, width * 0.8);
      const initialHeight = initialWidth / aspectRatio;
      
      // Center the image on the screen
      const centerX = width / 2 - initialWidth / 2;
      const centerY = height / 2 - initialHeight / 2;
      
      panValues[image.id].setValue({
        x: centerX,
        y: centerY,
      });

      onUpdate(image.id, {
        size: {width: initialWidth, height: initialHeight},
        position: {x: centerX, y: centerY},
      });
    });

    return () => {
      isMounted = false;
    };
  }, [image.uri, image.id, width, height, onUpdate]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(image.id),
      },
    ]);
  }, [image.id, onDelete]);

  const panResponder = useMemo(() => {
    if (!panValues[image.id]) {
      panValues[image.id] = new Animated.ValueXY({
        x: image.position.x,
        y: image.position.y,
      });
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = image.position.x + gestureState.dx;
        const newY = image.position.y + gestureState.dy;
        
        panValues[image.id].setValue({
          x: newX,
          y: newY,
        });
        
        onUpdate(image.id, {
          position: {
            x: newX,
            y: newY,
          },
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        onSelect(image.id);
        const newX = image.position.x + gestureState.dx;
        const newY = image.position.y + gestureState.dy;
        
        panValues[image.id].setValue({
          x: newX,
          y: newY,
        });
        
        onUpdate(image.id, {
          position: {
            x: newX,
            y: newY,
          },
        });
      },
    });
  }, [image.id, image.position, panValues, onSelect, onUpdate]);

  const resizeResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const aspectRatio = image.size.width / image.size.height;
        let newWidth = Math.max(50, image.size.width + gestureState.dx);
        let newHeight = newWidth / aspectRatio;
        if (newHeight < 50) {
          newHeight = 50;
          newWidth = newHeight * aspectRatio;
        }
        onUpdate(image.id, {
          size: {width: newWidth, height: newHeight},
        });
      },
    });
  }, [image.id, image.size.width, image.size.height, onUpdate]);

  const imageStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(() => ({
    transform: [
      {
        translateX: Animated.multiply(
          animatedSize,
          panValues[image.id]?.x || 0,
        ),
      },
      {
        translateY: Animated.multiply(
          animatedSize,
          panValues[image.id]?.y || 0,
        ),
      },
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
    top: 0,
    left: 0,
  }), [animatedSize, image.id, image.size.width, image.size.height, panValues]);

  return (
    <Animated.View {...panResponder.panHandlers} style={imageStyle}>
      <Image
        source={{uri: image.uri}}
        style={{
          width: '100%',
          height: '100%',
          resizeMode: 'contain',
        }}
      />
      {isSelected && !isZoomed && (
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
            }}>
            <Icon
              name="resize"
              style={{transform: [{rotate: '90deg'}]}}
              size={20}
              color="black"
            />
          </View>
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              position: 'absolute',
              right: -10,
              top: -10,
              width: 30,
              height: 30,
              backgroundColor: '#eee',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon name="trash" size={20} color="black" />
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

export default React.memo(CustomImage);
