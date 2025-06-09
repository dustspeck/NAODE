import {View, Animated} from 'react-native';
import {scale} from 'react-native-size-matters';
import Label from '../Label';
import {useEffect, useRef} from 'react';

export const EditorStarterCue = () => {
  const horizontalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(horizontalAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(horizontalAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, []);

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              translateX: horizontalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-scale(20), scale(0)],
              }),
            },
          ],
        },
        {
          position: 'absolute',
          right: scale(40),
          top: scale(5),
          width: scale(120),
          zIndex: 1000,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          flexDirection: 'row',
        },
      ]}>
      <View
        style={{
          backgroundColor: '#222',
          padding: scale(5),
          paddingHorizontal: scale(10),
          borderRadius: scale(10),
          borderTopRightRadius: scale(0),
        }}>
        <Label
          text="Start by adding an element"
          style={{color: '#eee', fontSize: scale(7)}}
        />
      </View>
      <View
        style={{
          height: '100%',
          borderRadius: scale(10),
          borderRightWidth: scale(10),
          borderTopWidth: scale(10),
          borderTopColor: '#222',
          borderTopLeftRadius: scale(0),
        }}
      />
    </Animated.View>
  );
};
