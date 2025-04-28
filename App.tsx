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

const {OverlayModule} = NativeModules;

function App(): React.JSX.Element {
  const [hasPermission, setHasPermission] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

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

  const toggleOverlay = () => {
    if (Platform.OS === 'android') {
      OverlayModule.toggleOverlay();
      setIsOverlayVisible(!isOverlayVisible);
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
                Grant Overlay Permission
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default App;
