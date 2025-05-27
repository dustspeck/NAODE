import {NativeModules, StyleSheet, Text, View} from 'react-native';
import Toggle from '../../atoms/Toggle';
import {scale} from 'react-native-size-matters';
import Label from '../../atoms/Label';
import {useEditorStore} from '../../../services/mmkv';
import {useState} from 'react';

const Header = () => {
  const [store, setStore] = useEditorStore();
  const [isLoading, setIsLoading] = useState(false);
  const {OverlayModule} = NativeModules;

  const handleTogglePressed = () => {
    if (!store.isEnabled) {
      setIsLoading(true);
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
      <View style={{width: scale(40)}}>
        <Toggle
          isImportant
          isEnabled={store.isEnabled}
          isLoading={isLoading}
          onTogglePressed={handleTogglePressed}
        />
      </View>
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
});

export default Header;
