import React, {useMemo} from 'react';
import {TouchableOpacity, useWindowDimensions, StyleProp, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {EDIT_CONTROLS_RATIO} from '../../constants/ui';

interface ControlIconProps {
  name: string;
  color?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const ControlIcon: React.FC<ControlIconProps> = React.memo(({name, color, onPress, style}) => {
  const {width} = useWindowDimensions();
  
  const iconStyle = useMemo(() => ({
    padding: 10
  }), []);

  const iconSize = useMemo(() => 
    width * EDIT_CONTROLS_RATIO * 0.5
  , [width]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      <Icon
        name={name}
        style={iconStyle}
        size={iconSize}
        color={color ?? 'white'}
      />
    </TouchableOpacity>
  );
});

ControlIcon.displayName = 'ControlIcon';

export default ControlIcon;
