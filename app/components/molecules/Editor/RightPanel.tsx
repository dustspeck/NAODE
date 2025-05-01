import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import Icon from 'react-native-vector-icons/Ionicons';

const RightPanel: React.FC<{animatedSize: Animated.Value}> = ({
  animatedSize,
}) => {
  const {width, height} = useWindowDimensions();
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
        <TouchableOpacity onPress={() => {}} activeOpacity={0.8}>
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
