import React, {useRef, useEffect, useMemo, useCallback, useState} from 'react';
import {
  Animated,
  useWindowDimensions,
  BackHandler,
  ViewStyle,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import ZoomOutIcon from '../../atoms/ZoomOutIcon';
import {useEditorContext} from '../../../context/EditorContext';
import CustomImage from '../Assets/CustomImage';
import CustomText from '../Assets/CustomText';
import {ImageData, TextData} from '../../../types';
import Label from '../../atoms/Label';
import ControlIcon from '../../atoms/ControlIcon';
import {useEditorStore} from '../../../services/mmkv';
import {scale} from 'react-native-size-matters';
import LockScreenIcon from '../../atoms/LockScreenIcon';
import {NativeModules} from 'react-native';

const {OverlayModule} = NativeModules;

interface EditorProps {
  animatedSize: Animated.Value;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
  panValues: {[key: string]: Animated.ValueXY};
  editorBorderWidth: number;
}

const FullScreenControls = ({
  isZoomed,
  setIsZoomed,
}: {
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
}) => {
  const {height} = useWindowDimensions();
  if (!isZoomed) return null;
  return (
    <View
      style={{
        position: 'absolute',
        top: height / 8,
        left: 10,
        zIndex: 1000,
        gap: scale(20),
      }}>
      <ZoomOutIcon isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
      <LockScreenIcon
        onPress={() => {
          OverlayModule.lockScreen();
        }}
      />
    </View>
  );
};

// Separate component for element rendering to prevent unnecessary re-renders
const ElementRenderer = React.memo(
  ({
    element,
    isSelected,
    isZoomed,
    animatedSize,
    panValues,
    onSelect,
    onUpdate,
    onDelete,
  }: {
    element: ImageData | TextData;
    isSelected: boolean;
    isZoomed: boolean;
    animatedSize: Animated.Value;
    panValues: {[key: string]: Animated.ValueXY};
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<ImageData | TextData>) => void;
    onDelete: (id: string) => void;
  }) => {
    if (element.type === 'image') {
      return (
        <CustomImage
          key={element.id}
          image={element as ImageData}
          isSelected={isSelected}
          isZoomed={isZoomed}
          animatedSize={animatedSize}
          panValues={panValues}
          onSelect={onSelect}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      );
    }

    return (
      <CustomText
        key={element.id}
        text={element as TextData}
        isSelected={isSelected}
        isZoomed={isZoomed}
        animatedSize={animatedSize}
        panValues={panValues}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.element === nextProps.element &&
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

ElementRenderer.displayName = 'ElementRenderer';

const Editor: React.FC<EditorProps> = React.memo(
  ({animatedSize, isZoomed, setIsZoomed, panValues, editorBorderWidth}) => {
    const {
      elements,
      selectedElementId,
      setSelectedElementId,
      handleUpdateImage,
      handleDeleteElement,
      handleUpdateText,
      updateElements,
    } = useEditorContext();
    const {width, height} = useWindowDimensions();
    const [store] = useEditorStore();
    const backHandlerRef = useRef<{remove: () => void} | null>(null);
    const [isDebugEnabled, setIsDebugEnabled] = useState(false);

    useEffect(() => {
      updateElements(store.elements);
    }, []);

    // Clean up panValues when elements are deleted
    useEffect(() => {
      const currentElementIds = new Set(elements.map(element => element.id));
      const keysToDelete = Object.keys(panValues).filter(
        id => !currentElementIds.has(id),
      );

      if (keysToDelete.length > 0) {
        keysToDelete.forEach(id => {
          delete panValues[id];
        });
      }
    }, [elements, panValues]);

    useEffect(() => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }

      backHandlerRef.current = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isZoomed) {
            setIsZoomed(false);
            return true;
          }
          return false;
        },
      );

      return () => {
        if (backHandlerRef.current) {
          backHandlerRef.current.remove();
        }
      };
    }, [isZoomed, setIsZoomed]);

    const containerStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
      () => ({
        width: animatedSize.interpolate({
          inputRange: [0, 1],
          outputRange: [0, width],
        }),
        height: animatedSize.interpolate({
          inputRange: [0, 1],
          outputRange: [0, height],
        }),
        backgroundColor: 'transparent',
        borderRadius: 10,
        borderWidth: isZoomed ? 0 : editorBorderWidth,
        borderColor: '#555',
        justifyContent: 'space-between',
        alignItems: 'center' as const,
        overflow: 'hidden',
      }),
      [animatedSize, width, height, isZoomed, editorBorderWidth],
    );

    const handlePress = useCallback(() => {
      setSelectedElementId(null);
    }, [setSelectedElementId]);

    // Memoize the element handlers to prevent unnecessary re-renders
    const elementHandlers = useMemo(
      () => ({
        onSelect: setSelectedElementId,
        onUpdate: (id: string, updates: Partial<ImageData | TextData>) => {
          if (updates.type === 'image') {
            handleUpdateImage(id, updates as Partial<ImageData>);
          } else {
            handleUpdateText(id, updates as Partial<TextData>);
          }
        },
        onDelete: handleDeleteElement,
      }),
      [
        setSelectedElementId,
        handleUpdateImage,
        handleUpdateText,
        handleDeleteElement,
      ],
    );

    // Memoize sorted elements to prevent unnecessary sorting on every render
    const sortedElements = useMemo(
      () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
      [elements],
    );

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <Animated.View style={containerStyle}>
          {elements.length === 0 && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
              }}>
              <Label
                text="No items added"
                style={{fontWeight: '900', fontSize: 15, color: '#888'}}
              />
              <View
                style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                <Label text="Tap the" style={{color: '#888'}} />
                <ControlIcon name="add" onPress={() => {}} />
                <Label text="icon to add an element" style={{color: '#888'}} />
              </View>
            </View>
          )}
          {sortedElements.map(element => (
            <ElementRenderer
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              isZoomed={isZoomed}
              animatedSize={animatedSize}
              panValues={panValues}
              onSelect={elementHandlers.onSelect}
              onUpdate={elementHandlers.onUpdate}
              onDelete={elementHandlers.onDelete}
            />
          ))}
          <FullScreenControls isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.animatedSize === nextProps.animatedSize &&
      prevProps.isZoomed === nextProps.isZoomed &&
      prevProps.setIsZoomed === nextProps.setIsZoomed &&
      prevProps.panValues === nextProps.panValues &&
      prevProps.editorBorderWidth === nextProps.editorBorderWidth
    );
  },
);

Editor.displayName = 'Editor';

export default Editor;
