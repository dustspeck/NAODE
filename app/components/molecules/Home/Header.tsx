import {StyleSheet, View} from 'react-native';
import {scale} from 'react-native-size-matters';
import Label from '../../atoms/Label';
import {useEditorStore} from '../../../services/mmkv';
import { MainToggle } from '../../atoms/animations/MainToggle';

const Header = () => {
  const [store, setStore] = useEditorStore();

  const handleTogglePressed = () => {
    setStore({isEnabled: !store.isEnabled});
  };

  return (
    <View style={styles.headerContainer}>
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row'}}>
          <Label
            text="Aodes"
            style={{fontSize: 18, fontWeight: 'bold', color: '#eeea'}}
          />
          <Label
            text="ign."
            style={{fontSize: 18, fontWeight: '200', color: '#eeea'}}
          />
        </View>
      </View>
      <View style={styles.toggleContainer}>
        <MainToggle
          isEnabled={store.isEnabled}
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
    padding: scale(10),
    paddingHorizontal: scale(20),
    paddingRight: scale(15),
    marginHorizontal: -scale(5),
    backgroundColor: '#eee1',
    borderRadius: scale(15),
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
