import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {scale} from 'react-native-size-matters';

interface PremiumIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const PremiumIcon = ({
  size = scale(8),
  color = '#fc7',
  style,
}: PremiumIconProps) => {
  return (
    <View style={[{position: 'absolute', top: 0, right: 0}, style]}>
      <Icon name="diamond" size={size} color={color} />
    </View>
  );
};

export default PremiumIcon;
