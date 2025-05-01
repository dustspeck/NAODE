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
import {useOverlayStore} from './app/services/mmkv';
import {launchImageLibrary} from 'react-native-image-picker';
import {IOverlay} from './app/models/OverlayModel';

function App(): React.JSX.Element {
  const {OverlayModule} = NativeModules;
  const [hasPermission, setHasPermission] = useState(false);
  const {store, addOverlay, updateOverlay, removeOverlay, setActiveOverlay} = useOverlayStore();

  const checkPermission = async () => {
    const permission = await OverlayModule.checkAccessibilityPermission();
    setHasPermission(permission);
  };

  const requestPermission = () => {
    OverlayModule.requestAccessibilityPermission();
  };

  const pickImage = (overlayId: string) => {
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
        updateOverlay(overlayId, {customImagePath: imagePath});
      }
    });
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const renderOverlayControls = (overlay: IOverlay) => (
    <View key={overlay.id} style={{marginBottom: 20, padding: 10, backgroundColor: '#1C1C1E', borderRadius: 8}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
        <Text style={{color: '#fff', fontSize: 16}}>Overlay {overlay.id.slice(0, 4)}</Text>
        <TouchableOpacity
          onPress={() => removeOverlay(overlay.id)}
          style={{
            backgroundColor: '#FF3B30',
            padding: 8,
            borderRadius: 4,
          }}>
          <Text style={{color: '#fff'}}>Remove</Text>
        </TouchableOpacity>
      </View>
      <Text style={{color: '#fff'}}>Size: {overlay.size}</Text>
      <Slider
        value={overlay.size}
        minimumValue={100}
        maximumValue={600}
        step={10}
        onValueChange={value => updateOverlay(overlay.id, {size: value[0]})}
      />
      <TouchableOpacity
        onPress={() => pickImage(overlay.id)}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 10,
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
            marginTop: 10,
            borderRadius: 8,
          }}
        />
      )}
    </View>
  );

  return (
    <View style={{backgroundColor: '#000', flex: 1}}>
      <StatusBar barStyle={'light-content'} backgroundColor={'#000'} />
      <ScrollView style={{backgroundColor: '#000'}}>
        <View style={{marginTop: 100, padding: 20}}>
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
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                <Text style={{color: '#fff', fontSize: 20}}>Overlays</Text>
                <TouchableOpacity
                  onPress={addOverlay}
                  style={{
                    backgroundColor: '#34C759',
                    padding: 10,
                    borderRadius: 8,
                  }}>
                  <Text style={{color: '#fff'}}>Add Overlay</Text>
                </TouchableOpacity>
              </View>
              {store.overlays.map(renderOverlayControls)}
              {store.overlays.length > 0 && (
                <TouchableOpacity
                  onPress={() => OverlayModule.updateOverlay()}
                  style={{
                    backgroundColor: '#007AFF',
                    padding: 15,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <Text style={{color: '#fff', fontSize: 16}}>
                    Update Overlays
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default App;
