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

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    useEffect(() => {
      // Only initialize position and size if they haven't been set yet
      if (
        !isInitialized.current &&
        (!text.position.x ||
          !text.position.y ||
          !text.fontSize ||
          !text.size.width ||
          !text.size.height)
      ) {
        let timeoutId: NodeJS.Timeout;

        if (!isMounted.current) return;

        let textWidth = 0;
        let textHeight = 0;
        textRef.current?.measure((_x, _y, width, _height, _pageX, _pageY) => {
          textWidth = width;
        });

        textRef.current?.measure((_x, _y, _width, height, _pageX, _pageY) => {
          textHeight = height;
        });

        const centerX = width / 2 - textWidth / 2;
        const centerY = height / 2 - textHeight / 2;

        timeoutId = setTimeout(() => {
          if (!isMounted.current) return;

          panValues[text.id].setValue({
            x: centerX,
            y: centerY,
          });

          onUpdate(text.id, {
            size: {width: textWidth, height: textHeight},
            position: {
              x: centerX,
              y: centerY,
            },
          });

          isInitialized.current = true;
        }, 0);

        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      }
    }, [
      text,
      text.id,
      width,
      height,
      onUpdate,
      panValues,
      text.position,
      text.size,
      text.fontSize,
    ]);

    // Calculate the size of the text based on the font size
    useEffect(() => {
      if (!textRef.current) return;

      const timeoutId = setTimeout(() => {
        textRef.current?.measure((_x, _y, width, height, _pageX, _pageY) => {
          if (!isMounted.current) return;

          // Scale the text to the size of the edit window
          const newWidth = width * (1 / EDIT_WINDOW_RATIO);
          const newHeight = height * (1 / EDIT_WINDOW_RATIO);

          // Only update if dimensions have actually changed

          if (width !== newWidth || height !== newHeight) {
            onUpdate(text.id, {
              size: {
                width: newWidth,
                height: newHeight,
              },
            });
          }
        });
      }, 100); // Add debounce to prevent rapid updates

      return () => clearTimeout(timeoutId);
    }, [text.fontSize, text.id, onUpdate, text.size.width, text.size.height]);

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

          onUpdate(text.id, {
            fontSize: newFontSize,
          });
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
        text.fontSize,
        text.rotation,
        text.zIndex,
        text.size.width,
        text.size.height,
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
