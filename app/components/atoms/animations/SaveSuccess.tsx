import LottieView from 'lottie-react-native';
import {scale} from 'react-native-size-matters';
import saveSuccessAnimation from '../../../assets/animations/save_success.lottie';
import {View} from 'react-native';
import {useRef} from 'react';

export const SaveSuccess = () => {
  const lottieRef = useRef<LottieView>(null);
  return (
    <View
      style={{
        height: scale(40),
        width: scale(50),
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <LottieView
        source={saveSuccessAnimation}
        ref={lottieRef}
        autoPlay={false}
        duration={2000}
        enableSafeModeAndroid
        onAnimationLoaded={() => {
          lottieRef.current?.play(35, 86);
        }}
        loop={false}
        style={{height: scale(80), width: scale(100)}}
        colorFilters={[
          {keypath: 'Shape Layer 1', color: '#fff'},
          {keypath: 'Shape Layer 2', color: '#fff'},
          {keypath: 'Shape Layer 3', color: '#222'},
          {keypath: 'Shape Layer 4', color: '#fff'},
        ]}
      />
    </View>
  );
};
