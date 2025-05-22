import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Animated,
  useWindowDimensions,
  Text,
  PanResponder,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {TextData} from '../../../types';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  EDIT_WINDOW_RATIO,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from '../../../constants/ui';
import ModalWindow from '../ModalWindow';
import ActionButton from '../../atoms/ActionButton';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';

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

// Separate component for selection controls to prevent unnecessary re-renders
const SelectionControls = React.memo(
  ({
    onDelete,
    resizeResponder,
  }: {
    onDelete: () => void;
    resizeResponder: ReturnType<typeof PanResponder.create>;
  }) => {
    const selectionBorderStyle = useMemo<ViewStyle>(
      () => ({
        position: 'absolute',
        top: -1,
        left: -1,
        right: -1,
        bottom: -1,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 0,
      }),
      [],
    );

    const controlButtonStyle = useMemo<ViewStyle>(
      () => ({
        position: 'absolute',
        width: 30,
        height: 30,
        backgroundColor: '#eee',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
      }),
      [],
    );

    const deleteButtonStyle = useMemo<ViewStyle>(
      () => ({
        ...controlButtonStyle,
        right: -10,
        top: -10,
      }),
      [controlButtonStyle],
    );

    const resizeButtonStyle = useMemo<ViewStyle>(
      () => ({
        ...controlButtonStyle,
        right: -10,
        bottom: -10,
      }),
      [controlButtonStyle],
    );

    return (
      <>
        <View style={selectionBorderStyle} />
        <TouchableOpacity onPress={onDelete} style={deleteButtonStyle}>
          <Icon name="close" size={20} color="black" />
        </TouchableOpacity>
        <View {...resizeResponder.panHandlers} style={resizeButtonStyle}>
          <Icon
            name="resize"
            size={20}
            style={{transform: [{rotate: '90deg'}]}}
            color="black"
          />
        </View>
      </>
    );
  },
);

SelectionControls.displayName = 'SelectionControls';

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
    const lastText = useRef(text.text);
    const lastFontWeight = useRef(text.fontWeight);
    const lastFontFamily = useRef(text.fontFamily);
    const lastDimensions = useRef({width: 0, height: 0});
    const [isDeleting, setIsDeleting] = useState(false);

    // Memoize the text style to prevent recreation on every render
    const textContentStyle = useMemo<Animated.WithAnimatedObject<TextStyle>>(
      () => ({
        fontSize: animatedSize.interpolate({
          inputRange: [0, 1],
          outputRange: [0, text.fontSize],
        }),
        color: text.color,
        fontWeight: text.fontWeight,
        fontFamily: text.fontFamily,
      }),
      [
        animatedSize,
        text.fontSize,
        text.color,
        text.fontWeight,
        text.fontFamily,
      ],
    );

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
          textRef.current?.measure(
            (_x, _y, textWidth, textHeight, _pageX, _pageY) => {
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
            },
          );
        };

        resizeAnimationFrame.current =
          requestAnimationFrame(measureAndInitialize);

        return () => {
          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }
        };
      }
    }, [text.id, width, height, onUpdate, panValues]);

    useEffect(() => {
      if (
        !textRef.current ||
        (text.fontSize === lastFontSize.current &&
          text.text === lastText.current &&
          text.fontWeight === lastFontWeight.current &&
          text.fontFamily === lastFontFamily.current)
      )
        return;

      const updateDimensions = () => {
        textRef.current?.measure(
          (_x, _y, textWidth, textHeight, _pageX, _pageY) => {
            if (!isMounted.current) return;

            const newWidth = textWidth * (1 / EDIT_WINDOW_RATIO);
            const newHeight = textHeight * (1 / EDIT_WINDOW_RATIO);

            if (
              Math.abs(newWidth - lastDimensions.current.width) > 1 ||
              Math.abs(newHeight - lastDimensions.current.height) > 1
            ) {
              lastDimensions.current = {width: newWidth, height: newHeight};
              onUpdate(text.id, {
                size: {width: newWidth, height: newHeight},
              });
            }
          },
        );
      };

      resizeAnimationFrame.current = requestAnimationFrame(updateDimensions);
      lastFontSize.current = text.fontSize;
      lastText.current = text.text;
      lastFontWeight.current = text.fontWeight;
      lastFontFamily.current = text.fontFamily;
      return () => {
        if (resizeAnimationFrame.current) {
          cancelAnimationFrame(resizeAnimationFrame.current);
        }
      };
    }, [text.fontSize, text.id, text.text, onUpdate]);

    const DeleteModal = useCallback(() => {
      return (
        <ModalWindow
          isVisible={isDeleting}
          heading="Delete Text"
          subHeading="This action cannot be undone."
          content={() => (
            <View style={{gap: 10}}>
              <Label text="Are you sure you want to delete this text?" />
              <View
                style={{
                  flexDirection: 'row-reverse',
                  gap: 10,
                  paddingTop: scale(10),
                }}>
                <ActionButton
                  text="Delete"
                  onPress={() => onDelete(text.id)}
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
    }, [text.id, onDelete, isDeleting]);

    const handleDelete = useCallback(() => {
      setIsDeleting(true);
    }, []);

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

          const angle = (text.rotation * Math.PI) / 180;
          const cos = Math.cos(-angle);
          const sin = Math.sin(-angle);

          const dx = gestureState.dx * cos - gestureState.dy * sin;

          let newFontSize = Math.max(MIN_FONT_SIZE, text.fontSize + dx);
          if (newFontSize > MAX_FONT_SIZE) {
            newFontSize = MAX_FONT_SIZE;
          }

          if (resizeAnimationFrame.current) {
            cancelAnimationFrame(resizeAnimationFrame.current);
          }

          resizeAnimationFrame.current = requestAnimationFrame(() => {
            if (!isMounted.current) return;
            onUpdate(text.id, {
              fontSize: newFontSize,
            });
          });
        },
        onPanResponderRelease: () => {
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
      [animatedSize, panValues, text.id, text.rotation, text.zIndex],
    );

    return (
      <>
      <Animated.View {...panResponder.panHandlers} style={textStyle}>
        <Animated.Text ref={textRef} style={textContentStyle}>
          {text.text}
        </Animated.Text>
        {isSelected && !isZoomed && (
          <SelectionControls
            onDelete={handleDelete}
            resizeResponder={resizeResponder}
          />
        )}
        </Animated.View>
        <DeleteModal />
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.text === nextProps.text &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isZoomed === nextProps.isZoomed &&
      prevProps.animatedSize === nextProps.animatedSize &&
      prevProps.panValues === nextProps.panValues &&
      prevProps.onSelect === nextProps.onSelect &&
      prevProps.onUpdate === nextProps.onUpdate &&
      prevProps.onDelete === nextProps.onDelete
    );
  },
);

CustomText.displayName = 'CustomText';

export default CustomText;
