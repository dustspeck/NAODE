import {NativeModules, StyleSheet, View, Animated} from 'react-native';
import Toggle from '../../atoms/Toggle';
import {scale} from 'react-native-size-matters';
import Label from '../../atoms/Label';
import {useEditorStore} from '../../../services/mmkv';
import {useState, useEffect, useRef} from 'react';

const Header = () => {
  const [store, setStore] = useEditorStore();
  const [isLoading, setIsLoading] = useState(false);
  const {OverlayModule} = NativeModules;
  
  // Multiple animation values for different effects
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const justEnabled = useRef(false);

  useEffect(() => {
    if (store.isEnabled && justEnabled.current) {
      // Reset animations
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);

      // Complex animation sequence
      Animated.parallel([
        // Scale up with spring effect
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.3,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),

        // Subtle opacity pulse
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Reset the flag after animation
      justEnabled.current = false;
    }
  }, [store.isEnabled]);

  const handleTogglePressed = () => {
    if (!store.isEnabled) {
      setIsLoading(true);
      justEnabled.current = true; // Set flag when user enables
      setTimeout(() => {
        setIsLoading(false);
        setStore({isEnabled: true});
      }, 500);
    } else {
      OverlayModule.removeAllOverlays();
      setStore({isEnabled: false});
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row'}}>
          <Label text="Aodes" style={{fontSize: 24, fontWeight: 'bold'}} />
          <Label text="ign." style={{fontSize: 24, fontWeight: '200'}} />
        </View>
      </View>
      <Animated.View style={[
        styles.toggleContainer,
        {
          transform: [
            { scale: scaleAnim }
          ],
          opacity: opacityAnim,
          shadowColor: '#00ff00',
          shadowOffset: { width: 0, height: 0 },
        }
      ]}>
        <Toggle
          isImportant
          isEnabled={store.isEnabled}
          isLoading={isLoading}
          onTogglePressed={handleTogglePressed}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleContainer: {
    width: scale(40),
  },
});

export default Header;
