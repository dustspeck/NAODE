import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  View,
  Animated,
  useWindowDimensions,
  Text,
  PanResponder,
  TextStyle,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {TextData} from '../../../types';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  EDIT_WINDOW_RATIO,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from '../../../constants/ui';

interface CustomTextProps {
  text: TextData;
  isSelected: boolean;
  isZoomed: boolean;
  animatedSize: Animated.Value;
  panValues: {[key: string]: Animated.ValueXY};
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TextData>) => void;
  onDelete: (id: string) => void;
}

const CustomText: React.FC<CustomTextProps> = React.memo(
  ({
    text,
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
    const textRef = useRef<Text>(null);
    const isInitialized = useRef(false);
    const lastUpdateTime = useRef(0);
    const resizeAnimationFrame = useRef<number | null>(null);
    const lastFontSize = useRef(text.fontSize);
    const lastDimensions = useRef({width: 0, height: 0});

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
        (!text.position.x ||
          !text.position.y ||
          !text.fontSize ||
          !text.size.width ||
          !text.size.height)
      ) {
        if (!textRef.current) return;

        const measureAndInitialize = () => {
          textRef.current?.measure((_x, _y, textWidth, textHeight, _pageX, _pageY) => {
            if (!isMounted.current) return;

            const centerX = width / 2 - textWidth / 2;
            const centerY = height / 2 - textHeight / 2;

            panValues[text.id].setValue({
              x: centerX,
              y: centerY,
            });

            onUpdate(text.id, {
              size: {width: textWidth, height: textHeight},
              position: {x: centerX, y: centerY},
            });

            lastDimensions.current = {width: textWidth, height: textHeight};
            isInitialized.current = true;
          });
        };

        resizeAnimationFrame.current = requestAnimationFrame(measureAndInitialize);

        return () => {
          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }
        };
      }
    }, [text.id, width, height, onUpdate, panValues]);

    // Update dimensions when font size changes
    useEffect(() => {
      if (!textRef.current || text.fontSize === lastFontSize.current) return;

      const updateDimensions = () => {
        textRef.current?.measure((_x, _y, textWidth, textHeight, _pageX, _pageY) => {
          if (!isMounted.current) return;

          const newWidth = textWidth * (1 / EDIT_WINDOW_RATIO);
          const newHeight = textHeight * (1 / EDIT_WINDOW_RATIO);

          // Only update if dimensions have changed significantly
          if (
            Math.abs(newWidth - lastDimensions.current.width) > 1 ||
            Math.abs(newHeight - lastDimensions.current.height) > 1
          ) {
            lastDimensions.current = {width: newWidth, height: newHeight};
            onUpdate(text.id, {
              size: {width: newWidth, height: newHeight},
            });
          }
        });
      };

      // Use requestAnimationFrame for smooth updates
      resizeAnimationFrame.current = requestAnimationFrame(updateDimensions);
      lastFontSize.current = text.fontSize;

      return () => {
        if (resizeAnimationFrame.current) {
          cancelAnimationFrame(resizeAnimationFrame.current);
        }
      };
    }, [text.fontSize, text.id, onUpdate]);

    const handleDelete = useCallback(() => {
      Alert.alert('Delete Text', 'Are you sure you want to delete this text?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(text.id),
        },
      ]);
    }, [text.id, onDelete]);

    const panResponder = useMemo(() => {
      if (!panValues[text.id]) {
        panValues[text.id] = new Animated.ValueXY({
          x: text.position.x,
          y: text.position.y,
        });
      }

      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const newX = text.position.x + gestureState.dx;
          const newY = text.position.y + gestureState.dy;

          panValues[text.id].setValue({
            x: newX,
            y: newY,
          });
        },
        onPanResponderRelease: (_, gestureState) => {
          onSelect(text.id);
          const newX = text.position.x + gestureState.dx;
          const newY = text.position.y + gestureState.dy;

          panValues[text.id].setValue({
            x: newX,
            y: newY,
          });

          onUpdate(text.id, {
            position: {
              x: newX,
              y: newY,
            },
          });
        },
      });
    }, [text.id, text.position, panValues, onSelect, onUpdate]);

    const resizeResponder = useMemo(() => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const now = Date.now();
          if (now - lastUpdateTime.current < 16) return; // Cap at ~60fps
          lastUpdateTime.current = now;

          // Convert gesture coordinates to text space considering rotation
          const angle = (text.rotation * Math.PI) / 180;
          const cos = Math.cos(-angle);
          const sin = Math.sin(-angle);

          // Transform gesture coordinates to text space
          const dx = gestureState.dx * cos - gestureState.dy * sin;

          let newFontSize = Math.max(MIN_FONT_SIZE, text.fontSize + dx);
          if (newFontSize > MAX_FONT_SIZE) {
            newFontSize = MAX_FONT_SIZE;
          }

          // Cancel any pending animation frame
          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }

          // Schedule the update for the next frame
          resizeAnimationFrame.current = requestAnimationFrame(() => {
            if (!isMounted.current) return;
            onUpdate(text.id, {
              fontSize: newFontSize,
            });
          });
        },
        onPanResponderRelease: () => {
          // Ensure the final update is processed
          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }
        },
      });
    }, [text.id, text.fontSize, text.rotation, onUpdate]);

    const textStyle = useMemo<Animated.WithAnimatedObject<TextStyle>>(
      () => ({
        transform: [
          {
            translateX: Animated.multiply(
              animatedSize,
              panValues[text.id]?.x || 0,
            ),
          },
          {
            translateY: Animated.multiply(
              animatedSize,
              panValues[text.id]?.y || 0,
            ),
          },
          {
            rotate: `${text.rotation}deg`,
          },
        ],
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: text.zIndex,
      }),
      [
        animatedSize,
        panValues,
        text.id,
        text.rotation,
        text.zIndex,
      ],
    );

    return (
      <Animated.View {...panResponder.panHandlers} style={textStyle}>
        <Animated.Text
          ref={textRef}
          style={{
            fontSize: animatedSize.interpolate({
              inputRange: [0, 1],
              outputRange: [0, text.fontSize],
            }),
            color: text.color,
            fontWeight: text.fontWeight,
            fontFamily: text.fontFamily,
          }}>
          {text.text}
        </Animated.Text>
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
                size={20}
                style={{transform: [{rotate: '90deg'}]}}
                color="black"
              />
            </View>
          </>
        )}
      </Animated.View>
    );
  },
);

export default CustomText;
