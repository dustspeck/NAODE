import React, {useEffect, useMemo, useCallback, useRef} from 'react';
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
import {MIN_IMAGE_SIZE} from '../../../constants/ui';

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

const CustomImage: React.FC<CustomImageProps> = React.memo(
  ({
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
    const isMounted = useRef(true);
    const isInitialized = useRef(false);
    const lastUpdateTime = useRef(0);
    const resizeAnimationFrame = useRef<number | null>(null);
    const initialDimensions = useRef({width: 0, height: 0});
    const initialPosition = useRef({x: 0, y: 0});
    const initialGesture = useRef({x: 0, y: 0});
    const aspectRatio = useRef(1);

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
        if (resizeAnimationFrame.current) {
          cancelAnimationFrame(resizeAnimationFrame.current);
        }
      };
    }, []);

    useEffect(() => {
      if (
        !isInitialized.current &&
        (!image.position.x ||
          !image.position.y ||
          !image.size.width ||
          !image.size.height)
      ) {
        Image.getSize(image.uri, (imgWidth, imgHeight) => {
          if (!isMounted.current) return;

          const ratio = imgWidth / imgHeight;
          aspectRatio.current = ratio;
          const initialWidth = Math.min(200, width * 0.8);
          const initialHeight = initialWidth / ratio;
          const centerX = width / 2 - initialWidth / 2;
          const centerY = height / 2 - initialHeight / 2;

          resizeAnimationFrame.current = requestAnimationFrame(() => {
            if (!isMounted.current) return;

            panValues[image.id].setValue({
              x: centerX,
              y: centerY,
            });

            onUpdate(image.id, {
              size: {width: initialWidth, height: initialHeight},
              position: {x: centerX, y: centerY},
            });

            initialDimensions.current = {width: initialWidth, height: initialHeight};
            initialPosition.current = {x: centerX, y: centerY};
            isInitialized.current = true;
          });
        });
      }
    }, [image.uri, image.id, width, height, onUpdate, panValues]);

    const handleDelete = useCallback(() => {
      Alert.alert(
        'Delete Image',
        'Are you sure you want to delete this image?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(image.id),
          },
        ],
      );
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
        onPanResponderGrant: (_, gestureState) => {
          initialDimensions.current = {
            width: image.size.width,
            height: image.size.height,
          };
          initialPosition.current = {
            x: image.position.x,
            y: image.position.y,
          };
          initialGesture.current = {
            x: gestureState.x0,
            y: gestureState.y0,
          };
        },
        onPanResponderMove: (_, gestureState) => {
          const now = Date.now();
          if (now - lastUpdateTime.current < 16) return; // Cap at ~60fps
          lastUpdateTime.current = now;

          // Calculate the distance moved from the initial touch point
          const dx = gestureState.moveX - initialGesture.current.x;
          const dy = gestureState.moveY - initialGesture.current.y;

          // Calculate the diagonal distance moved
          const distance = Math.sqrt(dx * dx + dy * dy);
          const direction = Math.atan2(dy, dx);

          // Calculate the new width based on the diagonal movement
          const newWidth = Math.max(
            MIN_IMAGE_SIZE,
            initialDimensions.current.width + distance * Math.cos(direction),
          );
          const newHeight = newWidth / aspectRatio.current;

          // Calculate the new position to maintain the resize handle position
          const newX = initialPosition.current.x;
          const newY = initialPosition.current.y;

          // Cancel any pending animation frame
          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }

          // Schedule the update for the next frame
          resizeAnimationFrame.current = requestAnimationFrame(() => {
            if (!isMounted.current) return;

            onUpdate(image.id, {
              size: {width: newWidth, height: newHeight},
              position: {x: newX, y: newY},
            });

            panValues[image.id].setValue({
              x: newX,
              y: newY,
            });
          });
        },
        onPanResponderRelease: () => {
          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }
        },
      });
    }, [image.id, image.position, image.size, onUpdate, panValues]);

    const imageStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
      () => ({
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
          {
            rotate: `${image.rotation}deg`,
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
        zIndex: image.zIndex,
      }),
      [
        animatedSize,
        image.id,
        image.size.width,
        image.size.height,
        image.zIndex,
        image.rotation,
        panValues,
      ],
    );

    const borderRadius = useMemo(() => {
      return animatedSize.interpolate({
        inputRange: [0, 1],
        outputRange: [
          0,
          image.size.width > image.size.height
            ? (image.size.height / 100) * image.borderRadius
            : (image.size.width / 100) * image.borderRadius,
        ],
      });
    }, [image.size.width, image.size.height, image.borderRadius, animatedSize]);

    return (
      <Animated.View {...panResponder.panHandlers} style={imageStyle}>
        <Animated.Image
          source={{uri: image.uri}}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
            borderRadius,
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
              <Icon name="close" size={20} color="black" />
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    );
  },
);

CustomImage.displayName = 'CustomImage';

export default CustomImage;
