import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  NativeModules,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import {Slider} from '@miblanchard/react-native-slider';
import {useOverlay} from './app/services/mmkv';

function App(): React.JSX.Element {
  const {OverlayModule} = NativeModules;
  const [hasPermission, setHasPermission] = useState(false);
  const [overlay, setOverlay] = useOverlay();

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      const permission = await OverlayModule.checkAccessibilityPermission();
      setHasPermission(permission);
    }
  };

  const requestPermission = () => {
    if (Platform.OS === 'android') {
      OverlayModule.requestAccessibilityPermission();
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return (
    <View style={{backgroundColor: '#000', flex: 1}}>
      <StatusBar barStyle={'light-content'} backgroundColor={'#000'} />
      <ScrollView style={{backgroundColor: '#000'}}>
        <View style={{marginTop: 100}}>
          {!hasPermission ? (
            <TouchableOpacity
              onPress={requestPermission}
              style={{
                backgroundColor: '#007AFF',
                padding: 15,
                borderRadius: 8,
                alignItems: 'center',
              }}>
              <Text style={{color: '#fff', fontSize: 16}}>
                Grant Accessibility Permission
              </Text>
            </TouchableOpacity>
          ) : (
            <View>
              <Text>Overlay</Text>
              <Text style={{color: '#fff'}}>Size: {overlay.size}</Text>
              <Slider
                value={overlay.size}
                onValueChange={value => setOverlay({size: value[0]})}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default App;
