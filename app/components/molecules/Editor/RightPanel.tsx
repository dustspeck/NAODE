import React, { useEffect, useState } from 'react';
import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import {launchImageLibrary} from 'react-native-image-picker';
import {useEditorContext} from '../../../context/EditorContext';
import ControlIcon from '../../atoms/ControlIcon';
import RightPanelOverhead from '../../atoms/RightPanelOverhead';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';

interface RightPanelProps {
  animatedSize: Animated.Value;
}

const RightPanel: React.FC<RightPanelProps> = ({animatedSize}) => {
  const {width, height} = useWindowDimensions();
  const {handleAddImage, selectedElementId, handleAddText} = useEditorContext();
  const [isAddSelected, setIsAddSelected] = useState(false);
  const [isSaveSelected, setIsSaveSelected] = useState(false);
  const onAddPress = () => {
    setIsAddSelected(!isAddSelected);
  };

  const onAddImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.assets && response.assets[0]?.uri) {
          handleAddImage(response.assets[0].uri);
        }
      },
    );
    setIsAddSelected(false);
  };

  const onAddText = () => {
    handleAddText('Hello');
    setIsAddSelected(false);
  };

  useEffect(() => {
    if (selectedElementId === null) {
      setIsAddSelected(false);
    }
  }, [selectedElementId]);

  const handleSavePress = () => {
    setIsSaveSelected(!isSaveSelected);
  };

  return (
    <View>
      <Animated.View
        style={{
          width: width * EDIT_CONTROLS_RATIO,
          height: animatedSize.interpolate({
            inputRange: [0, 1],
            outputRange: [0, height],
          }),
          alignItems: 'center',
          gap: scale(10),
        }}>
          {isAddSelected && (
            <RightPanelOverhead>
              <Label text="Add new" style={{color: '#eee', fontSize: scale(5)}} />
              <View style={{flexDirection: 'row', gap: scale(10)}}>
                <ControlIcon
                  name="text-outline"
                  onPress={onAddText}
                  label="Text"
                />
                <ControlIcon
                  name="image-outline"
                  onPress={onAddImage}
                  label="Image"
                />
              </View>
            </RightPanelOverhead>
          )}
        <ControlIcon
          name="add-circle"
          onPress={onAddPress}
          isSelected={isAddSelected}
          label="Add"
          iconRatio={0.6}
        />
        <ControlIcon
          name="download-outline"
          onPress={handleSavePress}
          isSelected={isSaveSelected}
          label="Save image"
        />
      </Animated.View>
    </View>
  );
};

export default RightPanel;
