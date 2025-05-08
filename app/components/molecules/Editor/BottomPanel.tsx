import React, {useCallback, useEffect, useState} from 'react';
import {Animated, TextInput, View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import ControlIcon from '../../atoms/ControlIcon';
import {useEditorContext} from '../../../context/EditorContext';
import {scale} from 'react-native-size-matters';
import {Slider} from '@miblanchard/react-native-slider';
import Label from '../../atoms/Label';
import BottomPanelOverhead from '../../atoms/BottomPanelOverhead';
import ActionButton from '../../atoms/ActionButton';
import ModalWindow from '../ModalWindow';
import {ElementData} from '../../../types';
import ColorWheel from '../ColorWheel';

interface BottomPanelProps {
  panValues: {[key: string]: Animated.ValueXY};
}

const BottomPanel: React.FC<BottomPanelProps> = ({panValues}) => {
  const {
    selectedElementId,
    handleUpdateImage,
    handleUpdateText,
    elements,
    bringToFront,
    sendToBack,
  } = useEditorContext();
  const {width, height} = useWindowDimensions();
  const [isRotationSelected, setIsRotationSelected] = useState(false);
  const [isLayerSelected, setIsLayerSelected] = useState(false);
  const [isCenterSelected, setIsCenterSelected] = useState(false);
  const [isRadiusSelected, setIsRadiusSelected] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTextValueSelected, setIsTextValueSelected] = useState(false);

  useEffect(() => {
    deselectAll();
  }, [selectedElementId]);

  const selectedElement = selectedElementId
    ? elements.find(element => element.id === selectedElementId)
    : null;

  const deselectAll = () => {
    setIsRotationSelected(false);
    setIsLayerSelected(false);
    setIsCenterSelected(false);
    setIsRadiusSelected(false);
  };

  const handleSelectRotation = () => {
    deselectAll();
    setIsRotationSelected(!isRotationSelected);
  };

  const handleSelectLayers = () => {
    deselectAll();
    setIsLayerSelected(!isLayerSelected);
  };

  const handleSelectCenter = () => {
    deselectAll();
    setIsCenterSelected(!isCenterSelected);
  };

  const handleSelectColor = () => {
    deselectAll();
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleSelectTextValue = () => {
    deselectAll();
    setIsTextValueSelected(!isTextValueSelected);
  };

  const handleCenterAlignHorizontal = () => {
    if (selectedElementId) {
      const element = elements.find(
        element => element.id === selectedElementId,
      );
      if (element) {
        const currentX = element.position.x;
        const centerY = (height - element.size.height) / 2;
        panValues[selectedElementId].setValue({
          x: currentX,
          y: centerY,
        });
        switch (element.type) {
          case 'image':
            handleUpdateImage(selectedElementId, {
              position: {x: currentX, y: centerY},
            });
            break;
          case 'text':
            handleUpdateText(selectedElementId, {
              position: {x: currentX, y: centerY},
            });
            break;
        }
      }
    }
  };

  const handleCenterAlignVertical = () => {
    if (selectedElementId) {
      const element = elements.find(
        element => element.id === selectedElementId,
      );
      if (element) {
        const currentY = element.position.y;
        const centerX = (width - element.size.width) / 2;
        panValues[selectedElementId].setValue({
          x: centerX,
          y: currentY,
        });
        switch (element.type) {
          case 'image':
            handleUpdateImage(selectedElementId, {
              position: {x: centerX, y: currentY},
            });
            break;
          case 'text':
            handleUpdateText(selectedElementId, {
              position: {x: centerX, y: currentY},
            });
            break;
        }
      }
    }
  };

  const handleCenterAll = () => {
    if (selectedElementId) {
      const element = elements.find(
        element => element.id === selectedElementId,
      );
      if (element) {
        const centerX = (width - element.size.width) / 2;
        const centerY = (height - element.size.height) / 2;
        handleUpdateImage(selectedElementId, {
          position: {x: centerX, y: centerY},
        });
        panValues[selectedElementId].setValue({
          x: centerX,
          y: centerY,
        });
      }
    }
  };

  const snapToNearest90 = useCallback((currentRotation: number) => {
    // Find the nearest multiple of 90 within -180 to 180 range
    const normalizedRotation = ((currentRotation + 180) % 360) - 180;
    const nearest90 = Math.round(normalizedRotation / 90) * 90;
    return nearest90;
  }, []);

  const handleRotateRight = () => {
    if (selectedElementId && selectedElement) {
      const currentRotation = selectedElement.rotation;
      const nearest90 = snapToNearest90(currentRotation);
      const nextRotation = nearest90 + 90;
      // Ensure we stay within -180 to 180 range
      const newRotation = ((nextRotation + 180) % 360) - 180;
      handleUpdateImage(selectedElementId, {
        rotation: newRotation,
      });
    }
  };

  const handleRotationChange = (value: number[]) => {
    if (selectedElementId) {
      // Add snapping behavior around 0
      let rotation = value[0];
      if (Math.abs(rotation) < 5) {
        rotation = 0;
      }
      handleUpdateImage(selectedElementId, {
        rotation,
      });
    }
  };

  const handleSelectRadius = () => {
    deselectAll();
    setIsRadiusSelected(!isRadiusSelected);
  };

  const handleRadiusChange = (value: number[]) => {
    if (selectedElementId) {
      handleUpdateImage(selectedElementId, {
        borderRadius: value[0],
      });
    }
  };

  const handleColorChange = (hex: string) => {
    if (selectedElementId) {
      handleUpdateText(selectedElementId, {color: hex});
    }
  };

  const handleTextChange = (text: string) => {
    if (selectedElementId) {
      handleUpdateText(selectedElementId, {text});
    }
  };

  const ColorPickerContent = ({
    selectedElement,
  }: {
    selectedElement: ElementData;
  }) => {
    return (
      <View>
        {selectedElement.type === 'text' && (
          <View style={{flex: 1}}>
            <ColorWheel
              value={selectedElement.color}
              onChange={handleColorChange}
            />
            <ActionButton
              text="Done"
              style={{alignSelf: 'flex-end'}}
              onPress={() => setIsColorPickerVisible(false)}
            />
          </View>
        )}
      </View>
    );
  };

  const TextValueContent = ({
    selectedElement,
  }: {
    selectedElement: ElementData;
  }) => {
    return (
      <View>
        {selectedElement.type === 'text' && (
          <View style={{flex: 1}}>
            <TextInput
              multiline
              value={selectedElement.text}
              style={{
                backgroundColor: '#0a0a0a',
                paddingHorizontal: scale(10),
                paddingVertical: scale(5),
                borderRadius: scale(12),
                color: '#fff',
                fontSize: scale(16),
                marginBottom: scale(20),
              }}
              onChangeText={handleTextChange}
            />
            <ActionButton
              text="Done"
              style={{alignSelf: 'flex-end'}}
              onPress={() => setIsTextValueSelected(false)}
            />
          </View>
        )}
      </View>
    );
  };
  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width: width,
      }}>
      {selectedElementId && selectedElement && (
        <>
          <ModalWindow
            isVisible={isColorPickerVisible}
            onBackPressed={() => setIsColorPickerVisible(false)}
            heading="Choose Color"
            content={() => ColorPickerContent({selectedElement})}
          />
          <ModalWindow
            isVisible={isTextValueSelected}
            onBackPressed={() => setIsTextValueSelected(false)}
            heading="Edit Text"
            content={() => TextValueContent({selectedElement})}
          />

          {isRotationSelected && (
            <BottomPanelOverhead>
              <Label
                style={{width: scale(30)}}
                text={`${Math.round(selectedElement.rotation)}°`}
              />
              <View>
                <Slider
                  value={selectedElement.rotation}
                  trackClickable={false}
                  minimumValue={-180}
                  maximumValue={180}
                  minimumTrackTintColor="#fff"
                  maximumTrackTintColor="#333"
                  thumbTintColor="#fff"
                  trackStyle={{
                    height: scale(2),
                    width: scale(100),
                  }}
                  step={1}
                  onValueChange={handleRotationChange}
                />
              </View>
              <ControlIcon
                name="reload"
                iconStyle={{transform: [{rotate: '90deg'}]}}
                onPress={handleRotateRight}
              />
            </BottomPanelOverhead>
          )}

          {isLayerSelected && (
            <BottomPanelOverhead>
              <ControlIcon
                name="arrow-up"
                onPress={() =>
                  selectedElementId && bringToFront(selectedElementId)
                }
                label="Front"
              />
              <ControlIcon
                name="arrow-down"
                onPress={() =>
                  selectedElementId && sendToBack(selectedElementId)
                }
                label="Back"
              />
            </BottomPanelOverhead>
          )}

          {isCenterSelected && (
            <BottomPanelOverhead>
              <ControlIcon
                name="chevron-collapse"
                iconStyle={{transform: [{rotate: '90deg'}]}}
                onPress={handleCenterAlignVertical}
                label="X Axis"
              />
              <ControlIcon
                name="chevron-collapse"
                onPress={handleCenterAlignHorizontal}
                label="Y Axis"
              />
              <ControlIcon
                name="chevron-collapse"
                iconStyle={{transform: [{rotate: '45deg'}]}}
                onPress={handleCenterAll}
                label="Both"
              />
            </BottomPanelOverhead>
          )}
          {isRadiusSelected && selectedElement.type === 'image' && (
            <BottomPanelOverhead>
              <Label
                style={{width: scale(30)}}
                text={`${selectedElement.borderRadius}%`}
              />
              <Slider
                value={selectedElement.borderRadius}
                onValueChange={handleRadiusChange}
                minimumValue={0}
                maximumValue={50}
                step={1}
                trackStyle={{
                  height: scale(2),
                  width: scale(100),
                }}
                thumbTintColor="#fff"
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="#333"
                trackClickable={false}
              />
            </BottomPanelOverhead>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(8),
              justifyContent: 'center',
              marginTop: scale(2),
            }}>
            <ControlIcon
              name="chevron-collapse"
              iconStyle={{transform: [{rotate: '45deg'}]}}
              onPress={handleSelectCenter}
              isSelected={isCenterSelected}
              label="Center"
            />
            <View style={{width: 1, height: '100%', backgroundColor: '#333'}} />
            <ControlIcon
              name="swap-vertical"
              onPress={handleSelectLayers}
              isSelected={isLayerSelected}
              label="Layers"
            />
            <View style={{width: 1, height: '100%', backgroundColor: '#333'}} />
            <ControlIcon
              name="refresh"
              iconStyle={{
                transform: [{rotate: '90deg'}],
              }}
              onPress={handleSelectRotation}
              isSelected={isRotationSelected}
              label="Rotate"
            />
            {selectedElement.type === 'image' && (
              <>
                <View
                  style={{width: 1, height: '100%', backgroundColor: '#333'}}
                />
                <ControlIcon
                  name="square-outline"
                  onPress={handleSelectRadius}
                  isSelected={isRadiusSelected}
                  label="Radius"
                />
              </>
            )}
            {selectedElement.type === 'text' && (
              <>
                <View
                  style={{width: 1, height: '100%', backgroundColor: '#333'}}
                />
                <ControlIcon
                  name="color-fill-outline"
                  onPress={handleSelectColor}
                  isSelected={isColorPickerVisible}
                  label="Color"
                />
              </>
            )}
            {selectedElement.type === 'text' && (
              <>
                <View
                  style={{width: 1, height: '100%', backgroundColor: '#333'}}
                />
                <ControlIcon
                  name="pencil-outline"
                  onPress={handleSelectTextValue}
                  isSelected={isTextValueSelected}
                  label="Text"
                />
              </>
            )}
          </View>
        </>
      )}

      {!selectedElementId && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: scale(10),
          }}>
          <Label
            text={
              elements.length > 0
                ? 'Select element to edit'
                : 'Add element to edit'
            }
            style={{color: '#444a'}}
          />
        </View>
      )}
    </View>
  );
};

export default BottomPanel;
