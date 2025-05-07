import React, {useRef, useEffect, useMemo, useCallback, useState} from 'react';
import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  BackHandler,
  ViewStyle,
  View,
} from 'react-native';
import ZoomOutIcon from '../../atoms/ZoomOutIcon';
import {useEditorContext} from '../../../context/EditorContext';
import CustomImage from '../Assets/CustomImage';
import ControlIcon from '../../atoms/ControlIcon';
import Label from '../../atoms/Label';
import CustomText from '../Assets/CustomText';
import {ImageData, TextData} from '../../../types';

interface EditorProps {
  animatedSize: Animated.Value;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
  panValues: {[key: string]: Animated.ValueXY};
}

const Editor: React.FC<EditorProps> = React.memo(
  ({animatedSize, isZoomed, setIsZoomed, panValues}) => {
    const {
      elements,
      selectedElementId,
      setSelectedElementId,
      handleUpdateImage,
      handleDeleteElement,
      handleUpdateText,
    } = useEditorContext();
    const {width, height} = useWindowDimensions();
    const backHandlerRef = useRef<{remove: () => void} | null>(null);
    const [isDebugEnabled, setIsDebugEnabled] = useState(false);

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
        backgroundColor: 'black',
        borderRadius: 10,
        borderWidth: isZoomed ? 0 : 1,
        borderColor: '#555',
        justifyContent: 'space-between',
        alignItems: 'center' as const,
        overflow: 'hidden',
      }),
      [animatedSize, width, height, isZoomed],
    );

    const handlePress = useCallback(() => {
      setSelectedElementId(null);
    }, [setSelectedElementId]);

    const renderElements = useCallback(() => {
      // Sort images by zIndex to ensure correct layering
      const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

      return sortedElements.map(element => {
        switch (element.type) {
          case 'image':
            return (
              <CustomImage
                key={element.id}
                image={element as ImageData}
                isSelected={selectedElementId === element.id}
                isZoomed={isZoomed}
                animatedSize={animatedSize}
                panValues={panValues}
                onSelect={setSelectedElementId}
                onUpdate={handleUpdateImage}
                onDelete={handleDeleteElement}
              />
            );
          case 'text':
            return (
              <CustomText
                key={element.id}
                text={element as TextData}
                isSelected={selectedElementId === element.id}
                isZoomed={isZoomed}
                animatedSize={animatedSize}
                panValues={panValues}
                onSelect={setSelectedElementId}
                onUpdate={handleUpdateText}
                onDelete={handleDeleteElement}
              />
            );
        }
      });
    }, [
      elements,
      selectedElementId,
      isZoomed,
      animatedSize,
      panValues,
      setSelectedElementId,
      handleUpdateImage,
      handleDeleteElement,
      handleUpdateText,
    ]);

    return (
      <TouchableOpacity activeOpacity={1} onPress={handlePress}>
        <Animated.View style={containerStyle}>
          {isZoomed && (
            <ZoomOutIcon isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
          )}
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
          {elements.length > 0 && isDebugEnabled && (
            <>
              {elements.map(element => (
                <View
                  key={element.id}
                  style={{position: 'absolute', top: 0, left: 0}}>
                  <View
                    style={{
                      height: (height - element.size.height) / 2,
                      width: (width - element.size.width) / 2,
                      backgroundColor: '#f0f2',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: element.position.y,
                      left: element.position.x,
                      height: element.size.height,
                      width: element.size.width,
                      backgroundColor: '#f002',
                    }}
                  />
                </View>
              ))}
            </>
          )}
          {isDebugEnabled && <Label text={JSON.stringify(elements)} />}
          {renderElements()}
        </Animated.View>
          <ControlIcon
            name="build"
            style={{position: 'absolute', bottom: 70, right: 0, opacity: 0.5, zIndex: 1000}}
            onPress={() => setIsDebugEnabled(!isDebugEnabled)}
          />
      </TouchableOpacity>
    );
  },
);

Editor.displayName = 'Editor';

export default Editor;
