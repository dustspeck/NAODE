import {useEffect, useRef} from 'react';
import {NativeModules, StyleSheet, TouchableOpacity} from 'react-native';
import LottieView from 'lottie-react-native';
import {scale} from 'react-native-size-matters';
import {launchPaywall} from '../../../utils/premium';
import FabButton from '../../atoms/FabButton';

const GetPremiumButton = () => {
  const lottieRef = useRef<LottieView>(null);
  const {OverlayModule} = NativeModules;
  useEffect(() => {
    lottieRef.current?.play();
    const interval = setInterval(() => {
      lottieRef.current?.play();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    OverlayModule.triggerTickHaptic();
    launchPaywall();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.5}
      onPress={handlePress}>
      <LottieView
        ref={lottieRef}
        source={require('../../../assets/animations/sparkles.lottie')}
        autoPlay={false}
        loop={false}
        style={styles.lottie}
      />
      <FabButton
        isDisabled={false}
        icon="diamond-outline"
        isPrimary={false}
        onPress={handlePress}
        style={styles.button}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  lottie: {
    width: scale(60),
    height: scale(60),
    position: 'absolute',
    top: scale(-10),
    left: scale(-10),
    right: scale(-10),
    bottom: scale(-10),
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#fc72',
    borderWidth: 0.5,
    borderColor: '#fc77',
  },
});

export default GetPremiumButton;
