import {StyleSheet, TouchableOpacity, NativeModules} from 'react-native';
import {scale} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import Label from './Label';

interface IFabButtonProps {
  icon: string;
  isPrimary?: boolean;
  text?: string;
  onPress: () => void;
  isDisabled?: boolean;
}

const FabButton: React.FC<IFabButtonProps> = ({
  icon,
  text,
  isPrimary = true,
  onPress,
  isDisabled = false,
}) => {
  const {OverlayModule} = NativeModules;
  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={[
        isPrimary ? styles.fabButtonPrimary : styles.fabButtonSecondary,
        {opacity: isDisabled ? 0.5 : 1},
      ]}
      onPress={() => {
        OverlayModule.triggerTickHaptic();
        onPress();
      }}
      activeOpacity={0.8}>
      <Icon name={icon} size={scale(isPrimary ? 14 : 16)} color="#a2a2a2" />
      {text && (
        <Label
          text={text}
          style={{color: '#a2a2a2', fontSize: scale(8), fontWeight: 500}}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabButtonPrimary: {
    paddingVertical: scale(10),
    paddingLeft: scale(14),
    paddingRight: scale(16),
    backgroundColor: '#eee1',
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(10),
  },
  fabButtonSecondary: {
    height: scale(40),
    width: scale(40),
    backgroundColor: '#eee1',
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FabButton;
