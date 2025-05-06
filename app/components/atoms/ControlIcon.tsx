import React, {useMemo} from 'react';
import {
  TouchableOpacity,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
  Text,
  View,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {EDIT_CONTROLS_RATIO} from '../../constants/ui';
import {scale} from 'react-native-size-matters';

interface ControlIconProps {
  name: string;
  color?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
  iconRatio?: number;
  iconStyle?: StyleProp<ViewStyle>;
  isSelected?: boolean;
}

const ControlIcon: React.FC<ControlIconProps> = React.memo(
  ({name, color, onPress, style, label, iconRatio, iconStyle, isSelected}) => {
    const {width} = useWindowDimensions();

    const viewStyle = useMemo<ViewStyle>(
      () => ({
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isSelected ? '#333' : '#0000',
        borderRadius: scale(5),
        padding: scale(2),
      }),
      [isSelected],
    );

    const iconSize = useMemo(() => width * EDIT_CONTROLS_RATIO * (iconRatio ?? 0.5), [width, iconRatio]);

    const containerStyle = useMemo<ViewStyle>(
      () => ({
        alignItems: 'center',
        maxWidth: iconSize + scale(12), // icon size + padding
        flexShrink: 1,
      }),
      [iconSize],
    );

    const labelContainerStyle = useMemo<ViewStyle>(
      () => ({
        flexDirection: 'row',
      }),
      [],
    );

    const labelStyle = useMemo<TextStyle>(
      () => ({
        color: color ?? '#eeea',
        fontSize: scale(7),
        marginTop: scale(2),
        textAlign: 'center',
        flexWrap: 'wrap',
        width: '100%',
      }),
      [color],
    );

    return (
      <View style={containerStyle}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={[viewStyle, style]}>
          <Icon name={name} size={iconSize} color={color ?? 'white'} style={iconStyle} />
          {label && (
            <View style={labelContainerStyle}>
              <Text style={labelStyle}>{label}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

ControlIcon.displayName = 'ControlIcon';

export default ControlIcon;
