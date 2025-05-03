import React, {useEffect} from 'react';
import {
  Animated,
  PanResponder,
  View,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
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
    // Get the actual image dimensions when it loads
    Image.getSize(image.uri, (imgWidth, imgHeight) => {
      // Calculate the aspect ratio
      const aspectRatio = imgWidth / imgHeight;
      
      // Set a reasonable initial size while maintaining aspect ratio
      const initialWidth = Math.min(200, width * 0.8);
      const initialHeight = initialWidth / aspectRatio;
      
      onUpdate(image.id, {
        size: {width: initialWidth, height: initialHeight},
      });
    });
  }, [image.uri]);

  const handleDelete = () => {
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
  };

  const createPanResponder = () => {
    if (!panValues[image.id]) {
      panValues[image.id] = new Animated.ValueXY();
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, {dx: panValues[image.id].x, dy: panValues[image.id].y}],
        {
          useNativeDriver: false,
        },
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 2 && Math.abs(gestureState.dy) < 2) {
          onSelect(image.id);
        }
        panValues[image.id].extractOffset();
        onUpdate(image.id, {
          position: {
            x: gestureState.moveX,
            y: gestureState.moveY,
          },
        });
      },
    });
  };

  const createResizeResponder = () => {
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
  };

  const panResponder = createPanResponder();
  const resizeResponder = createResizeResponder();

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
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

export default CustomImage;
