import {TouchableOpacity, useWindowDimensions, StyleProp, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {EDIT_CONTROLS_RATIO} from '../../constants/ui';
const ControlIcon: React.FC<{
  name: string;
  color?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({name, color, onPress, style}) => {
  const {width} = useWindowDimensions();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      <Icon
        name={name}
        style={{padding: 10}}
        size={width * EDIT_CONTROLS_RATIO * 0.5}
        color={color ? color : 'white'}
      />
    </TouchableOpacity>
  );
};

export default ControlIcon;
