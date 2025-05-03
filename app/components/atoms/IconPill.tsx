import {GestureResponderEvent, TouchableOpacity, View} from 'react-native';
import Label from './Label';
import Icon from 'react-native-vector-icons/Ionicons';
import WarningIcon from './WarningIcon';
import {scale} from 'react-native-size-matters';

interface IIconPillProps {
  icon: string;
  text?: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  hasWarning?: boolean;
}

const IconPill: React.FC<IIconPillProps> = props => {
  const {icon, text, onPress, disabled, hasWarning} = props;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={{
        opacity: disabled ? 0.5 : 1,
        padding: scale(10),
        marginRight: text ? scale(5) : 0,
        flex: text ? 1 : 0,
        paddingVertical: scale(8),
        backgroundColor: '#151515',
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}>
      {hasWarning && <WarningIcon size={scale(12)} />}
      <Icon
        name={icon}
        color={'#a1a1a1'}
        size={scale(12)}
        style={{marginRight: text ? '15%' : 0}}
      />
      <View>
        <Label text={text || '​'} style={{fontSize: 10}} singleLine />
      </View>
    </TouchableOpacity>
  );
};

export default IconPill;
