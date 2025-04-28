import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  NativeModules,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {Slider} from '@miblanchard/react-native-slider';
import {useOverlay} from './app/services/mmkv';
import {launchImageLibrary} from 'react-native-image-picker';

function App(): React.JSX.Element {
  const {OverlayModule} = NativeModules;
  const [hasPermission, setHasPermission] = useState(false);
  const [overlay, setOverlay] = useOverlay();

  const checkPermission = async () => {
      const permission = await OverlayModule.checkAccessibilityPermission();
      setHasPermission(permission);
  };

  const requestPermission = () => {
    OverlayModule.requestAccessibilityPermission();
  };

  const pickImage = () => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0].uri) {
        const imagePath = response.assets[0].uri;
        setOverlay({...overlay, customImagePath: imagePath});
      }
    });
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
              <Text style={{color: '#fff'}}>Overlay</Text>
              <Text style={{color: '#fff'}}>Size: {overlay.size}</Text>
              <Slider
                value={overlay.size}
                onValueChange={value => setOverlay({size: value[0]})}
              />
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  backgroundColor: '#007AFF',
                  padding: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <Text style={{color: '#fff', fontSize: 16}}>
                  {overlay.customImagePath ? 'Change Image' : 'Select Image'}
                </Text>
              </TouchableOpacity>
              {overlay.customImagePath && (
                <Image
                  source={{uri: overlay.customImagePath}}
                  style={{
                    width: 200,
                    height: 200,
                    alignSelf: 'center',
                    marginTop: 20,
                    borderRadius: 8,
                  }}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default App;
