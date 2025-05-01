import {PixelRatio, Text, TextStyle, View, Animated} from 'react-native';
import WarningIcon from './WarningIcon'
import {scale} from 'react-native-size-matters'

interface ILabelProps {
  text: string;
  size?: number;
  style?: TextStyle;
  singleLine?: boolean;
  hasWarning?: boolean;
  animatedSize?: Animated.Value;
}

const fontScale = PixelRatio.getFontScale();
export const getFontSize = (size: number) => size / fontScale;

const Label: React.FC<ILabelProps> = props => {
  const baseSize = props.style?.fontSize ? scale(props.style?.fontSize) : scale(10);
  const size = props.animatedSize 
    ? props.animatedSize.interpolate({
        inputRange: [0, 1],
        outputRange: [0, baseSize],
      })
    : baseSize;

  return (
    <View>
      {props.hasWarning && (
        <WarningIcon size={props.size ? scale(props.size) : scale(20)} />
      )}
      <Animated.Text
        style={{color: '#eee', ...props.style, fontSize: size}}
        numberOfLines={props.singleLine ? 1 : undefined}>
        {props.text}
      </Animated.Text>
    </View>
  );
};

export default Label;
