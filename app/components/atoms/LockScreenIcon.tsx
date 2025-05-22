import {useWindowDimensions, View} from 'react-native';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {EDIT_CONTROLS_RATIO} from '../../constants/ui';
import {scale} from 'react-native-size-matters';

interface LockScreenIconProps { 
  onPress: () => void;
}

const LockScreenIcon: React.FC<LockScreenIconProps> = ({onPress}) => {
  const {width} = useWindowDimensions();
  return <View
  style={{
    backgroundColor: '#3335',
    borderRadius: 999,
    zIndex: 1000,
  }}>
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}>
    <Icon
      name="lock-closed"
      style={{
        padding: 10,
      }}
      size={width * EDIT_CONTROLS_RATIO * 0.5}
      color="#fff5"
    />
  </TouchableOpacity>
</View>
};

export default LockScreenIcon;
