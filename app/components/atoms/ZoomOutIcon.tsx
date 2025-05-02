import {useWindowDimensions, View} from 'react-native';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {EDIT_CONTROLS_RATIO} from '../../constants/ui';

interface ZoomOutIconProps {
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
}

const ZoomOutIcon: React.FC<ZoomOutIconProps> = ({isZoomed, setIsZoomed}) => {
  const {width, height} = useWindowDimensions();
  return (
    <View
      style={{
        position: 'absolute',
        top: height / 8,
        left: 10,
        opacity: 0.5,
        zIndex: 1000,
      }}>
      <TouchableOpacity
        onPress={() => setIsZoomed(!isZoomed)}
        activeOpacity={0.8}>
        <Icon
          name="contract"
          style={{padding: 10}}
          size={width * EDIT_CONTROLS_RATIO * 0.5}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

export default ZoomOutIcon;
