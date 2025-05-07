import React, {useCallback, useEffect, useState} from 'react';
import {Animated, View, useWindowDimensions, ScrollView} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import ControlIcon from '../../atoms/ControlIcon';
import {useEditorContext} from '../../../context/EditorContext';
import {scale} from 'react-native-size-matters';
import {Slider} from '@miblanchard/react-native-slider';
import Label from '../../atoms/Label';
import BottomPanelOverhead from '../../atoms/BottomPanelOverhead';

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

  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width: width,
      }}>
      {selectedElementId && selectedElement && (
        <>
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
