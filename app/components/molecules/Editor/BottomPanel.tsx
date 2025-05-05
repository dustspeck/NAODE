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
  const {selectedImageId, handleUpdateImage, images, bringToFront, sendToBack} =
    useEditorContext();
  const {width, height} = useWindowDimensions();
  const [isRotationSelected, setIsRotationSelected] = useState(false);
  const [isLayerSelected, setIsLayerSelected] = useState(false);
  const [isCenterSelected, setIsCenterSelected] = useState(false);

  useEffect(() => {
    deselectAll();
  }, [selectedImageId]);

  const selectedImage = selectedImageId
    ? images.find(image => image.id === selectedImageId)
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
    if (selectedImageId) {
      const image = images.find(image => image.id === selectedImageId);
      if (image) {
        const currentX = image.position.x;
        const centerY = (height - image.size.height) / 2;
        handleUpdateImage(selectedImageId, {
          position: {x: currentX, y: centerY},
        });
        panValues[selectedImageId].setValue({
          x: currentX,
          y: centerY,
        });
      }
    }
  };

  const handleCenterAlignVertical = () => {
    if (selectedImageId) {
      const image = images.find(image => image.id === selectedImageId);
      if (image) {
        const currentY = image.position.y;
        const centerX = (width - image.size.width) / 2;
        handleUpdateImage(selectedImageId, {
          position: {x: centerX, y: currentY},
        });
        panValues[selectedImageId].setValue({
          x: centerX,
          y: currentY,
        });
      }
    }
  };

  const handleCenterAll = () => {
    if (selectedImageId) {
      const image = images.find(image => image.id === selectedImageId);
      if (image) {
        const centerX = (width - image.size.width) / 2;
        const centerY = (height - image.size.height) / 2;
        handleUpdateImage(selectedImageId, {
          position: {x: centerX, y: centerY},
        });
        panValues[selectedImageId].setValue({
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
    if (selectedImageId && selectedImage) {
      const currentRotation = selectedImage.rotation;
      const nearest90 = snapToNearest90(currentRotation);
      const nextRotation = nearest90 + 90;
      // Ensure we stay within -180 to 180 range
      const newRotation = ((nextRotation + 180) % 360) - 180;
      handleUpdateImage(selectedImageId, {
        rotation: newRotation,
      });
    }
  };

  const handleRotationChange = (value: number[]) => {
    if (selectedImageId) {
      // Add snapping behavior around 0
      let rotation = value[0];
      if (Math.abs(rotation) < 5) {
        rotation = 0;
      }
      handleUpdateImage(selectedImageId, {
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
      {selectedImageId && selectedImage && (
        <>
          {isRotationSelected && (
            <BottomPanelOverhead>
              <Label
                style={{width: scale(30)}}
                text={`${Math.round(selectedImage.rotation)}°`}
              />
              <View>
                <Slider
                  value={selectedImage.rotation}
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
                onPress={() => selectedImageId && bringToFront(selectedImageId)}
                label="Front"
              />
              <ControlIcon
                name="arrow-down"
                onPress={() => selectedImageId && sendToBack(selectedImageId)}
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

      {!selectedImageId && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: scale(10),
          }}>
          <Label
            text={images.length > 0 ? 'Select element to edit' : 'Add element to edit'}
            style={{color: '#444a'}}
          />
        </View>
      )}
    </View>
  );
};

export default BottomPanel;
