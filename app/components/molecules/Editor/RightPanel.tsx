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

interface RightPanelProps {
  animatedSize: Animated.Value;
}

const RightPanel: React.FC<RightPanelProps> = ({animatedSize}) => {
  const {width, height} = useWindowDimensions();
  const {handleAddImage} = useEditorContext();

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
        <TouchableOpacity
          onPress={() => {
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
          }}
          activeOpacity={0.8}>
          <Icon
            name="add-circle"
            size={width * EDIT_CONTROLS_RATIO * 0.8}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default RightPanel;
