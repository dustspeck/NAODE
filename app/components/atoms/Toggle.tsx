import {
  GestureResponderEvent,
  NativeModules,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {scale} from 'react-native-size-matters';

interface IToggleProps {
  isEnabled: boolean;
  isLoading: boolean;
  onTogglePressed: (event: GestureResponderEvent) => void;
}

const Toggle: React.FC<IToggleProps> = props => {
  const {isEnabled, isLoading, onTogglePressed} = props;
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
        {isEnabled ? (
          <Icon
            name="toggle"
            size={scale(30)}
            style={{color: '#e1e1e1', textAlign: 'center'}}
          />
        ) : (
          <Icon
            name="toggle-outline"
            size={scale(30)}
            style={{
              color: '#e1e1e1',
              textAlign: 'center',
              transform: [{rotate: '180deg'}],
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Toggle;
