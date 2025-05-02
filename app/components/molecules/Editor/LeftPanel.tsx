import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import ControlIcon from '../../atoms/ControlIcon';

interface LeftPanelProps {
  animatedSize: Animated.Value;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  animatedSize,
  isZoomed,
  setIsZoomed,
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
        <ControlIcon name="expand" onPress={() => setIsZoomed(!isZoomed)} />
      </Animated.View>
    </View>
  );
};

export default LeftPanel;
