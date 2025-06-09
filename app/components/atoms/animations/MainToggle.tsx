import {NativeModules, TouchableOpacity} from 'react-native';
import LottieView from 'lottie-react-native';
import {scale} from 'react-native-size-matters';
import {useEffect, useRef} from 'react';

interface MainToggleProps {
  isEnabled: boolean;
  onTogglePressed: () => void;
}

export const MainToggle = ({isEnabled, onTogglePressed}: MainToggleProps) => {
  const {OverlayModule} = NativeModules;
  const toggleRef = useRef<LottieView>(null);

  const handleTogglePressed = () => {
    OverlayModule.triggerTickHaptic();
    if (!isEnabled) {
      toggleRef.current?.play(0, 45);
    } else {
      toggleRef.current?.play(45, 0);
      OverlayModule.removeAllOverlays();
    }
    setTimeout(() => {
      onTogglePressed();
    }, 100);
  };

  useEffect(() => {
    if (isEnabled) toggleRef.current?.play(45, 45);
    else toggleRef.current?.play(0, 0);
  }, []);

  return (
    <TouchableOpacity onPress={handleTogglePressed} activeOpacity={1}>
      <LottieView
        source={require('../../../assets/animations/toggle.lottie')}
        ref={toggleRef}
        loop={false}
        speed={1.75}
        enableSafeModeAndroid
        colorFilters={[
          {
            keypath: 'Toggle BG Outlines',
            color: isEnabled ? '#afafaf' : 'black',
          },
          {
            keypath: 'icon circle',
            color: '#1d1d1d',
          },
          {
            keypath: 'Cross Outlines',
            color: isEnabled ? '#e3e3e3' : '#ff4343',
          },
        ]}
        style={{height: scale(20), width: scale(35)}}
      />
    </TouchableOpacity>
  );
};
