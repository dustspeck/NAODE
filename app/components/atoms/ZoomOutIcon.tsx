import {useWindowDimensions, View} from 'react-native';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {EDIT_CONTROLS_RATIO} from '../../constants/ui';
import {scale} from 'react-native-size-matters';
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
        backgroundColor: '#3335',
        borderRadius: 999,
        zIndex: 1000,
      }}>
      <TouchableOpacity
        onPress={() => setIsZoomed(!isZoomed)}
        activeOpacity={0.8}>
        <Icon
          name="exit"
          style={{
            padding: 10,
            transform: [{rotate: '180deg'}, {translateX: scale(2)}],
          }}
          size={width * EDIT_CONTROLS_RATIO * 0.5}
          color="#fff3"
        />
      </TouchableOpacity>
    </View>
  );
};

export default ZoomOutIcon;
