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
  const {handleAddImage, selectedImageId, handleAddText, selectedTextId} = useEditorContext();
  const [isAddSelected, setIsAddSelected] = useState(false);

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
    if (selectedImageId === null) {
      setIsAddSelected(false);
    }
  }, [selectedImageId]);

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
      </Animated.View>
    </View>
  );
};

export default RightPanel;
