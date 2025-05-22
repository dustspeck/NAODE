import {StyleSheet, TouchableOpacity, NativeModules} from 'react-native';
import {scale} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';

interface IFabButtonProps {
  icon: string;
  isPrimary?: boolean;
  onPress: () => void;
}

const FabButton: React.FC<IFabButtonProps> = ({
  icon,
  isPrimary = true,
  onPress,
}) => {
  const {OverlayModule} = NativeModules;
  return (
    <TouchableOpacity
      style={isPrimary ? styles.fabButtonPrimary : styles.fabButtonSecondary}
      onPress={() => {
        OverlayModule.triggerTickHaptic();
        onPress();
      }}
      activeOpacity={0.8}>
      <Icon
        name={icon}
        size={scale(isPrimary ? 20 : 16)}
        color={isPrimary ? '#333' : '#aaa'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabButtonPrimary: {
    height: scale(50),
    width: scale(50),
    backgroundColor: '#bbb',
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButtonSecondary: {
    height: scale(40),
    width: scale(40),
    backgroundColor: '#1e1e1e',
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FabButton;
