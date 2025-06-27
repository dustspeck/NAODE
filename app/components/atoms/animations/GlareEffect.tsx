import React, {useEffect, useRef} from 'react';
import {Animated, useWindowDimensions, View, ViewStyle} from 'react-native';
import {scale} from 'react-native-size-matters';

interface GlareEffectProps {
  isVisible: boolean;
  style?: ViewStyle;
}

export const GlareEffect: React.FC<GlareEffectProps> = ({isVisible, style}) => {
  const {width, height} = useWindowDimensions();
  const glareWidth = scale(height);
  const glareHeight = scale(width / 35);

  const translateX = useRef(new Animated.Value(-glareHeight)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const animationDuration = 1400;

  useEffect(() => {
    if (isVisible) {
      translateX.setValue(-glareHeight);
      translateY.setValue(height);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -height,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isVisible, translateX, translateY, opacity]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: glareWidth,
          height: glareHeight,
          backgroundColor: '#fff',
          transform: [{translateX}, {translateY}, {rotate: '45deg'}],
          opacity,
          zIndex: 1000,
        },
        style,
      ]}
    />
  );
};
