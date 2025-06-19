import React, {useEffect, useMemo, useCallback, useRef, useState} from 'react';
import {
  Animated,
  PanResponder,
  View,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  ViewStyle,
  AccessibilityInfo,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ImageData} from '../../../types';
import {MIN_IMAGE_SIZE} from '../../../constants/ui';
import ModalWindow from '../ModalWindow';
import ActionButton from '../../atoms/ActionButton';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';

// Constants
const FRAME_RATE_LIMIT = 16; // ~60fps
const INITIAL_IMAGE_WIDTH = 200;
const INITIAL_IMAGE_WIDTH_RATIO = 0.8;
const RESIZE_HANDLE_SIZE = 30;
const RESIZE_HANDLE_OFFSET = 10;
const SELECTION_BORDER_WIDTH = 1;
const SELECTION_BORDER_COLOR = '#eee';
const RESIZE_HANDLE_BORDER_RADIUS = 10;

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

interface StickerBorderProps {
  image: ImageData;
  borderRadius: Animated.AnimatedInterpolation<string | number>;
}

// Separate component for sticker border to optimize rendering
const StickerBorder: React.FC<StickerBorderProps> = React.memo(
  ({image, borderRadius}) => {
    const borderStyle = useMemo(
      () => ({
        width: '100%' as const,
        height: '100%' as const,
        resizeMode: 'contain' as const,
        borderRadius,
        opacity: 1,
        tintColor: image.stickerBorderColor ?? 'white',
        position: 'absolute' as const,
      }),
      [borderRadius, image.opacity, image.stickerBorderColor],
    );

    const borderPositions = useMemo(
      () => [
        {
          marginTop: -image.stickerBorderWidth,
          marginLeft: -image.stickerBorderWidth,
        },
        {
          marginTop: image.stickerBorderWidth,
          marginLeft: -image.stickerBorderWidth,
        },
        {
          marginTop: -image.stickerBorderWidth,
          marginLeft: image.stickerBorderWidth,
        },
        {
          marginTop: image.stickerBorderWidth,
          marginLeft: image.stickerBorderWidth,
        },
      ],
      [image.stickerBorderWidth],
    );

    return (
      <>
        {borderPositions.map((position, index) => (
          <Animated.Image
            key={index}
            source={{uri: image.uri}}
            style={[borderStyle, position]}
            accessibilityRole="image"
            accessibilityLabel={`Sticker border ${index + 1}`}
          />
        ))}
      </>
    );
  },
);

StickerBorder.displayName = 'StickerBorder';

// Separate component for selection controls
interface SelectionControlsProps {
  image: ImageData;
  onDelete: () => void;
  resizeResponder: ReturnType<typeof PanResponder.create>;
}

const SelectionControls: React.FC<SelectionControlsProps> = React.memo(
  ({onDelete, resizeResponder}) => {
    const controlStyle = useMemo(
      () => ({
        position: 'absolute' as const,
        width: RESIZE_HANDLE_SIZE,
        height: RESIZE_HANDLE_SIZE,
        backgroundColor: SELECTION_BORDER_COLOR,
        borderRadius: RESIZE_HANDLE_BORDER_RADIUS,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      }),
      [],
    );

    return (
      <>
        <View
          style={{
            position: 'absolute',
            top: -SELECTION_BORDER_WIDTH,
            left: -SELECTION_BORDER_WIDTH,
            right: -SELECTION_BORDER_WIDTH,
            bottom: -SELECTION_BORDER_WIDTH,
            borderWidth: SELECTION_BORDER_WIDTH,
            borderColor: SELECTION_BORDER_COLOR,
            borderRadius: 0,
          }}
          accessibilityRole="none"
        />
        <View
          {...resizeResponder.panHandlers}
          style={[controlStyle, {right: -RESIZE_HANDLE_OFFSET, bottom: -RESIZE_HANDLE_OFFSET}]}
          accessibilityRole="button"
          accessibilityLabel="Resize image"
          accessibilityHint="Drag to resize the image"
        >
          <Icon
            name="resize"
            style={{transform: [{rotate: '90deg'}]}}
            size={20}
            color="black"
          />
        </View>
        <TouchableOpacity
          onPress={onDelete}
          style={[controlStyle, {right: -RESIZE_HANDLE_OFFSET, top: -RESIZE_HANDLE_OFFSET}]}
          accessibilityRole="button"
          accessibilityLabel="Delete image"
          accessibilityHint="Tap to delete this image"
        >
          <Icon name="close" size={20} color="black" />
        </TouchableOpacity>
      </>
    );
  },
);

SelectionControls.displayName = 'SelectionControls';

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);

    // Cleanup effect
    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
        if (resizeAnimationFrame.current) {
          cancelAnimationFrame(resizeAnimationFrame.current);
        }
      };
    }, []);

    // Initialize image dimensions
    useEffect(() => {
      if (
        !isInitialized.current &&
        (!image.position.x ||
          !image.position.y ||
          !image.size.width ||
          !image.size.height)
      ) {
        Image.getSize(
          image.uri,
          (imgWidth, imgHeight) => {
            if (!isMounted.current) return;

            const ratio = imgWidth / imgHeight;
            const initialWidth = Math.min(INITIAL_IMAGE_WIDTH, width * INITIAL_IMAGE_WIDTH_RATIO);
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
                aspectRatio: ratio,
              });

              initialDimensions.current = {
                width: initialWidth,
                height: initialHeight,
              };
              initialPosition.current = {x: centerX, y: centerY};
              isInitialized.current = true;
            });
          },
          (error) => {
            console.error('Failed to load image dimensions:', error);
            setImageLoadError(true);
          },
        );
      }
    }, [image.uri, image.id, width, height, onUpdate, panValues]);

    // Handle image load error
    const handleImageError = useCallback(() => {
      setImageLoadError(true);
    }, []);

    // Delete modal component
    const DeleteModal = useCallback(() => {
      return (
        <ModalWindow
          isVisible={isDeleting}
          heading="Delete Image"
          subHeading="This action cannot be undone."
          content={() => (
            <View style={{gap: 10}}>
              <Label text="Are you sure you want to delete this image?" />
              <View
                style={{
                  flexDirection: 'row-reverse',
                  gap: 10,
                  paddingTop: scale(10),
                }}>
                <ActionButton
                  text="Delete"
                  onPress={() => onDelete(image.id)}
                />
                <ActionButton
                  text="Cancel"
                  type="Secondary"
                  onPress={() => setIsDeleting(false)}
                />
              </View>
            </View>
          )}
          onBackPressed={() => setIsDeleting(false)}
        />
      );
    }, [image.id, onDelete, isDeleting]);

    const handleDelete = useCallback(() => {
      setIsDeleting(true);
    }, []);

    // Pan responder for dragging
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

    // Resize responder for resizing
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
          if (now - lastUpdateTime.current < FRAME_RATE_LIMIT) return;
          lastUpdateTime.current = now;

          const dx = gestureState.moveX - initialGesture.current.x;
          const dy = gestureState.moveY - initialGesture.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const direction = Math.atan2(dy, dx);

          const newWidth = Math.max(
            MIN_IMAGE_SIZE,
            initialDimensions.current.width + distance * Math.cos(direction),
          );
          const newHeight = newWidth / image.aspectRatio;

          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }

          resizeAnimationFrame.current = requestAnimationFrame(() => {
            if (!isMounted.current) return;

            onUpdate(image.id, {
              size: {width: newWidth, height: newHeight},
              position: {
                x: initialPosition.current.x,
                y: initialPosition.current.y,
              },
            });

            panValues[image.id].setValue({
              x: initialPosition.current.x,
              y: initialPosition.current.y,
            });
          });
        },
        onPanResponderRelease: () => {
          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }
        },
      });
    }, [image.id, image.position, image.size, image.aspectRatio, onUpdate, panValues]);

    // Animated styles
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

    const mainImageStyle = useMemo(
      () => ({
        width: '100%' as const,
        height: '100%' as const,
        resizeMode: 'contain' as const,
        borderRadius,
        opacity: image.opacity,
      }),
      [borderRadius, image.opacity],
    );

    // Show error state if image failed to load
    if (imageLoadError) {
      return (
        <Animated.View {...panResponder.panHandlers} style={imageStyle}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
            }}
            accessibilityRole="image"
            accessibilityLabel="Failed to load image"
          >
            <Icon name="image-outline" size={40} color="#999" />
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View 
        {...panResponder.panHandlers} 
        style={imageStyle}
        accessibilityRole="image"
        accessibilityLabel={`Image ${image.id}`}
        accessibilityHint="Drag to move, double tap to select"
      >
        {image.stickerBorderWidth > 0 && (
          <StickerBorder image={image} borderRadius={borderRadius} />
        )}
        <Animated.Image
          source={{uri: image.uri}}
          style={mainImageStyle}
          onError={handleImageError}
          accessibilityRole="image"
          accessibilityLabel="Main image content"
        />
        {isSelected && !isZoomed && (
          <>
            <SelectionControls
              image={image}
              onDelete={handleDelete}
              resizeResponder={resizeResponder}
            />
            <DeleteModal />
          </>
        )}
      </Animated.View>
    );
  },
);

CustomImage.displayName = 'CustomImage';

export default CustomImage;
