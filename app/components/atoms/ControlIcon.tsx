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
import {usePurchases} from '../../context/PurchasesContext';
import {handlePremiumFeatureTap} from '../../utils/premium';
import PremiumIcon from './PremiumIcon';

interface ControlIconProps {
  name: string;
  color?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
  iconRatio?: number;
  iconStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  isSelected?: boolean;
  isPremium?: boolean;
  isDisabled?: boolean;
}

const ControlIcon: React.FC<ControlIconProps> = React.memo(
  ({
    name,
    color,
    onPress,
    style,
    label,
    iconRatio,
    iconStyle,
    isSelected,
    labelStyle,
    isPremium = false,
    isDisabled,
  }) => {
    const {width} = useWindowDimensions();
    const {user, isLoading} = usePurchases();

    const isPro = useMemo(() => {
      if (isLoading) {
        return false;
      }
      return user.pro;
    }, [user.pro, isLoading]);

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

    const iconSize = useMemo(
      () => width * EDIT_CONTROLS_RATIO * (iconRatio ?? 0.5),
      [width, iconRatio],
    );

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

    const labelTextStyle = useMemo<TextStyle>(
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
          onPress={() => handlePremiumFeatureTap(isPremium, isPro, onPress)}
          activeOpacity={0.8}
          disabled={isDisabled}
          style={[viewStyle, style, isDisabled && {opacity: 0.5}]}>
          {isPremium && !isPro && <PremiumIcon />}
          <Icon
            name={name}
            size={iconSize}
            color={color ?? 'white'}
            style={iconStyle}
          />
          {label && (
            <View style={labelContainerStyle}>
              <Text style={[labelTextStyle, labelStyle]}>{label}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

ControlIcon.displayName = 'ControlIcon';

export default ControlIcon;
