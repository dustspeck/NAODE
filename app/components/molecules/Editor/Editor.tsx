import {useState} from 'react';
import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Label from '../../atoms/Label';

interface EditorProps {
  animatedSize: Animated.Value;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
}

const Editor: React.FC<EditorProps> = ({
  animatedSize,
  isZoomed,
  setIsZoomed,
}) => {
  const {width, height} = useWindowDimensions();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setIsZoomed(!isZoomed)}>
      <Animated.View
        style={{
          width: animatedSize.interpolate({
            inputRange: [0, 1],
            outputRange: [0, width],
          }),
          height: animatedSize.interpolate({
            inputRange: [0, 1],
            outputRange: [0, height],
          }),
          backgroundColor: 'black',
          borderRadius: 10,
          borderWidth: isZoomed ? 0 : 1,
          borderColor: '#555',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 10,
        }}>
        <Label text="Start" animatedSize={animatedSize} />
        <Label text="End" animatedSize={animatedSize} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Editor;
