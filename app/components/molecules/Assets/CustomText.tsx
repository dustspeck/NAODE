import React, {useEffect, useMemo, useRef} from 'react';
import {
  View,
  Animated,
  useWindowDimensions,
  Text,
  PanResponder,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import {TextData} from '../../../types';
import Icon from 'react-native-vector-icons/Ionicons';
import {MAX_FONT_SIZE, MIN_FONT_SIZE} from '../../../constants/ui';

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
    const isInitialized = useRef(false);

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    useEffect(() => {
      // Only initialize position and size if they haven't been set yet
      if (!isInitialized.current && (!text.position.x || !text.position.y)) {
        let timeoutId: NodeJS.Timeout;

        timeoutId = setTimeout(() => {
          if (!isMounted.current) return;

          const centerX = 0;
          const centerY = 0;

          panValues[text.id].setValue({
            x: centerX,
            y: centerY,
          });

          onUpdate(text.id, {
            fontSize: MIN_FONT_SIZE,
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
      isSelected,
      isZoomed,
      animatedSize,
      panValues,
      onUpdate,
      text.position,
    ]);

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
        ],
        fontSize: animatedSize.interpolate({
          inputRange: [0, 1],
          outputRange: [0, text.fontSize],
        }),
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: text.zIndex,
      }),
      [animatedSize, panValues, text.id, text.fontSize],
    );

    return (
      <Animated.View {...panResponder.panHandlers} style={textStyle}>
        <Text
          style={{
            fontSize: text.fontSize,
            color: text.color,
            fontWeight: text.fontWeight,
            fontFamily: text.fontFamily,
          }}>
          {text.text}
        </Text>
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
              onPress={() => {}}
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
