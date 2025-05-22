import React from 'react';
import {GestureResponderEvent, TouchableOpacity, ViewStyle} from 'react-native';
import Label from './Label';
import {scale} from 'react-native-size-matters';

export interface IActionButtonProps {
  text: string;
  onPress: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  type?: 'Primary' | 'Secondary';
  style?: ViewStyle;
  disabled?: boolean;
}

const ActionButton: React.FC<IActionButtonProps> = ({
  text,
  onPress,
  onLongPress,
  type = 'Primary',
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{
        borderRadius: 999,
        backgroundColor: type === 'Secondary' ? '#0000' : '#eee',
        paddingHorizontal: scale(20),
        paddingVertical: scale(5),
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
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
