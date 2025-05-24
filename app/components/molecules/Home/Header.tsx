import {NativeModules, StyleSheet, Text, View} from 'react-native';
import Toggle from '../../atoms/Toggle';
import {scale} from 'react-native-size-matters';
import Label from '../../atoms/Label';
import { useEditorStore } from '../../../services/mmkv';

const Header = () => {
  const [store, setStore] = useEditorStore();
  const {OverlayModule} = NativeModules;

  const handleTogglePressed = () => {
    setStore({isEnabled: !store.isEnabled});
    OverlayModule.removeAllOverlays();
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
          isLoading={false}
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
