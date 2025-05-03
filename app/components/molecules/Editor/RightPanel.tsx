import React from 'react';
import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import {useEditorContext} from '../../../context/EditorContext';
import ControlIcon from '../../atoms/ControlIcon';

interface RightPanelProps {
  animatedSize: Animated.Value;
}

const RightPanel: React.FC<RightPanelProps> = ({animatedSize}) => {
  const {width, height} = useWindowDimensions();
  const {handleAddImage} = useEditorContext();

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
        }}>
        <ControlIcon
          name="add-circle"
          onPress={onAddImage}
          label="Add"
          iconRatio={0.7}
        />
      </Animated.View>
    </View>
  );
};

export default RightPanel;
