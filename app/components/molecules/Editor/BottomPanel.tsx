import React, {useCallback, useEffect, useState} from 'react';
import {
  Animated,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
  NativeModules,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {EDIT_CONTROLS_RATIO, FONTS} from '../../../constants/ui';
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
import TextBox from '../../atoms/TextBox';
import {getStickerURI, isStickerURI} from '../../../utils/common';

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
  const {OverlayModule} = NativeModules;
  const [isRotationSelected, setIsRotationSelected] = useState(false);
  const [isLayerSelected, setIsLayerSelected] = useState(false);
  const [isCenterSelected, setIsCenterSelected] = useState(false);
  const [isRadiusSelected, setIsRadiusSelected] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTextValueSelected, setIsTextValueSelected] = useState(false);
  const [isFontSelected, setIsFontSelected] = useState(false);
  const [isOpacitySelected, setIsOpacitySelected] = useState(false);
  const [isRemoveBackgroundLoading, setIsRemoveBackgroundLoading] =
    useState(false);
  const [isStickerSelected, setIsStickerSelected] = useState(false);
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
    setIsFontSelected(false);
    setIsOpacitySelected(false);
    setIsStickerSelected(false);
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

  const handleSelectFont = () => {
    deselectAll();
    setIsFontSelected(!isFontSelected);
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

  const handleBorderWidthChange = (value: number[]) => {
    if (selectedElementId) {
      handleUpdateImage(selectedElementId, {stickerBorderWidth: value[0]});
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

  const handleFontChange = (fontFamily: string) => {
    if (selectedElementId) {
      handleUpdateText(selectedElementId, {fontFamily});
    }
  };

  const handleSelectOpacity = () => {
    deselectAll();
    setIsOpacitySelected(!isOpacitySelected);
  };

  const handleOpacityChange = (value: number[]) => {
    if (selectedElementId) {
      handleUpdateImage(selectedElementId, {opacity: value[0]});
    }
  };

  const handleSelectSticker = () => {
    deselectAll();
    setIsStickerSelected(!isStickerSelected);
  };

  const handleAddBorder = () => {
    if (selectedElementId && selectedElement && selectedElement.type === 'image') {
      if (selectedElement.stickerBorderWidth < 3) {
        handleUpdateImage(selectedElementId, {stickerBorderWidth: 3});
      } else {
        handleUpdateImage(selectedElementId, {stickerBorderWidth: 0});
      }
      deselectAll();
      setIsRadiusSelected(true);
      setIsStickerSelected(false);
    }
  };

  const handleRemoveBackground = async () => {
    setIsRemoveBackgroundLoading(true);
    if (
      selectedElementId &&
      selectedElement &&
      selectedElement.type === 'image' &&
      'uri' in selectedElement
    ) {
      OverlayModule.triggerTickHaptic();
      try {
        const imageURI = selectedElement.uri;
        const stickerExists = isStickerURI(imageURI);
        if (stickerExists) {
          ToastAndroid.show('Sticker already created', ToastAndroid.SHORT);
          return;
        }
        const stickerURI = getStickerURI(imageURI);
        const result = await OverlayModule.removeBackground(imageURI);
        if (result) {
          handleUpdateImage(selectedElementId, {
            uri: stickerURI,
          });
          ToastAndroid.show('Sticker created', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show(
            'Error creating sticker, please try again',
            ToastAndroid.SHORT,
          );
        }
      } catch (error) {
        console.error('Error creating sticker:', error);
        ToastAndroid.show(
          'Error creating sticker, please try again',
          ToastAndroid.SHORT,
        );
      } finally {
        setIsRemoveBackgroundLoading(false);
      }
    }
  };

  const handleBorderColorChange = (hex: string) => {
    if (selectedElementId) {
      handleUpdateImage(selectedElementId, {stickerBorderColor: hex});
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
        {selectedElement.type === 'image' && (
          <View style={{flex: 1}}>
            <ColorWheel
              value={selectedElement.stickerBorderColor}
              onChange={handleBorderColorChange}
              hasOpacity={false}
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

  const TextValueContent: React.FC<{
    selectedElement: ElementData;
  }> = ({selectedElement}) => {
    if (selectedElement.type !== 'text') {
      return null;
    }
    const [text, setText] = useState(selectedElement.text);
    const handleDone = () => {
      setIsTextValueSelected(false);
      handleTextChange(text);
    };
    return (
      <View>
        {selectedElement.type === 'text' && (
          <View style={{flex: 1}}>
            <TextBox
              value={text}
              style={{
                backgroundColor: '#0a0a0a',
                paddingHorizontal: scale(10),
                paddingVertical: scale(5),
                borderRadius: scale(12),
                color: '#fff',
                fontSize: scale(16),
                marginBottom: scale(20),
              }}
              onChangeText={setText}
            />
            <ActionButton
              text="Done"
              style={{alignSelf: 'flex-end'}}
              onPress={handleDone}
            />
          </View>
        )}
      </View>
    );
  };

  const FontPickerContent: React.FC<{
    selectedElement: ElementData;
  }> = ({selectedElement}) => {
    return (
      <View>
        {selectedElement.type === 'text' && (
          <ScrollView>
            {FONTS.map(font => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={font.fontFamily}
                onPress={() => handleFontChange(font.fontFamily)}
                style={{
                  padding: scale(10),
                  backgroundColor:
                    selectedElement.fontFamily === font.fontFamily
                      ? '#303030'
                      : '#0a0a0a',
                  borderRadius: scale(12),
                  marginBottom: scale(10),
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}>
                  <Label
                    text={selectedElement.text}
                    singleLine
                    style={{
                      fontFamily: font.fontFamily,
                      fontSize: scale(10),
                    }}
                  />
                  <Label
                    text={font.name}
                    style={{
                      fontFamily: 'RobotoRegular',
                      color: '#aaa',
                      fontSize: scale(7),
                    }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width,
        backgroundColor: '#0c0c0c',
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
            content={() => (
              <TextValueContent selectedElement={selectedElement} />
            )}
          />
          <ModalWindow
            isVisible={isFontSelected}
            onBackPressed={() => setIsFontSelected(false)}
            heading="Choose Font"
            content={() => (
              <FontPickerContent selectedElement={selectedElement} />
            )}
            footerContent={
              <ActionButton
                text="Done"
                style={{alignSelf: 'flex-end'}}
                onPress={() => setIsFontSelected(false)}
              />
            }
          />
          <ModalWindow
            isVisible={isRemoveBackgroundLoading}
            onBackPressed={() => {}}
            heading="Please wait"
            content={() => (
              <View style={{gap: scale(20), flexDirection: 'row'}}>
                <ActivityIndicator size="large" color="#fff" />
                <Label text="Creating sticker" />
              </View>
            )}
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
            <BottomPanelOverhead top={-135}>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: scale(10),
                  marginVertical: scale(10),
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: scale(10),
                  }}>
                  <Label text="Radius" style={{fontSize: scale(6)}} />
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
                    maximumTrackTintColor="#666"
                    trackClickable={false}
                  />
                  <Label
                    style={{fontSize: scale(5), width: scale(25)}}
                    text={`${selectedElement.borderRadius * 2}%`}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: scale(10),
                  }}>
                  <Label text="Width" style={{fontSize: scale(6)}} />
                  <Slider
                    value={selectedElement.stickerBorderWidth}
                    onValueChange={handleBorderWidthChange}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    trackStyle={{
                      height: scale(2),
                      width: scale(100),
                    }}
                    thumbTintColor="#fff"
                    minimumTrackTintColor="#fff"
                    maximumTrackTintColor="#666"
                    trackClickable={false}
                  />
                  <Label
                    style={{fontSize: scale(5), width: scale(25)}}
                    text={`${selectedElement.stickerBorderWidth} pt`}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: scale(10),
                  }}>
                  <Label text="Color" style={{fontSize: scale(6)}} />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: scale(10),
                      width: scale(100),
                    }}>
                    <View
                      style={{
                        width: scale(10),
                        height: scale(10),
                        borderRadius: scale(10),
                        backgroundColor: selectedElement.stickerBorderColor,
                      }}
                    />
                    <Label
                      text={selectedElement.stickerBorderColor}
                    />
                  </View>
                  <ControlIcon
                    name="eyedrop"
                    onPress={handleSelectColor}
                    isSelected={isColorPickerVisible}
                  />
                </View>
              </View>
            </BottomPanelOverhead>
          )}
          {isOpacitySelected && selectedElement.type === 'image' && (
            <BottomPanelOverhead>
              <Label
                style={{width: scale(30)}}
                text={`${(selectedElement.opacity * 100).toFixed(0)}%`}
              />
              <Slider
                value={selectedElement.opacity}
                onValueChange={handleOpacityChange}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
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
          {isStickerSelected && selectedElement.type === 'image' && (
            <BottomPanelOverhead top={-65}>
              <ControlIcon
                name="person-outline"
                onPress={handleRemoveBackground}
                label="Remove BG"
                style={{width: scale(40)}}
              />
              <ControlIcon
                name="square-outline"
                onPress={handleAddBorder}
                label={
                  selectedElement.stickerBorderWidth > 0
                    ? 'Remove Border'
                    : 'Add Border'
                }
                style={{width: scale(40)}}
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
                  label="Border"
                />
              </>
            )}
            {selectedElement.type === 'image' && (
              <>
                <View
                  style={{width: 1, height: '100%', backgroundColor: '#333'}}
                />
                <ControlIcon
                  name="eye-outline"
                  onPress={handleSelectOpacity}
                  isSelected={isOpacitySelected}
                  label="Opacity"
                />
              </>
            )}
            {selectedElement.type === 'image' && (
              <>
                <View
                  style={{width: 1, height: '100%', backgroundColor: '#333'}}
                />
                <ControlIcon
                  name="happy-outline"
                  onPress={handleSelectSticker}
                  isSelected={isStickerSelected}
                  label="Sticker"
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
            {selectedElement.type === 'text' && (
              <>
                <View
                  style={{width: 1, height: '100%', backgroundColor: '#333'}}
                />
                <ControlIcon
                  name="text"
                  onPress={handleSelectFont}
                  isSelected={isFontSelected}
                  label="Font"
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
