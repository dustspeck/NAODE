import {GestureResponderEvent, TouchableOpacity, ViewStyle} from 'react-native';
import Label from './Label';
import {scale} from 'react-native-size-matters';

interface IActionButtonProps {
  text: string;
  onPress: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  type?: 'Primary' | 'Secondary';
  style?: ViewStyle;
}

const ActionButton: React.FC<IActionButtonProps> = props => {
  const {onPress, onLongPress, text, type, style} = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={{
        borderRadius: 999,
        backgroundColor: type === 'Secondary' ? '#0000' : '#eee',
        paddingHorizontal: scale(20),
        paddingVertical: scale(5),
        alignItems: 'center',
        ...style,
      }}>
      <Label
        text={text}
        singleLine
        style={{
          color: type === 'Secondary' ? '#eee' : '#222',
          fontWeight: '400',
        }}
      />
    </TouchableOpacity>
  );
};
export default ActionButton;
