import {
  GestureResponderEvent,
  NativeModules,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {scale} from 'react-native-size-matters';
import WarningIcon from './WarningIcon';

interface IToggleProps {
  isEnabled: boolean;
  isLoading: boolean;
  onTogglePressed: (event: GestureResponderEvent) => void;
  isImportant?: boolean;
}

const Toggle: React.FC<IToggleProps> = props => {
  const {isEnabled, isLoading, onTogglePressed, isImportant = false} = props;
  const {OverlayModule} = NativeModules;

  return (
    <TouchableOpacity
      disabled={isLoading}
      onPress={e => {
        OverlayModule.triggerTickHaptic();
        onTogglePressed(e);
      }}
      activeOpacity={0.8}
      style={{flex: 1}}>
      <View style={{opacity: isLoading ? 0.5 : 1}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {isImportant && !isEnabled && <WarningIcon size={scale(10)} />}
          {isEnabled ? (
            <Icon
              name="toggle"
              size={scale(30)}
              style={{
                color: '#eeea',
                textAlign: 'center',
                lineHeight: scale(20),
              }}
            />
          ) : (
            <Icon
              name="toggle-outline"
              size={scale(30)}
              style={{
                color: '#eeea',
                textAlign: 'center',
                transform: [{rotate: '180deg'}],
                lineHeight: scale(30),
              }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Toggle;
