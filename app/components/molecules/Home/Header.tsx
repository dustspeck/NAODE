import {StyleSheet, View} from 'react-native';
import {scale} from 'react-native-size-matters';
import Label from '../../atoms/Label';
import {useEditorStore} from '../../../services/mmkv';
import {MainToggle} from '../../atoms/animations/MainToggle';
import {usePurchases} from '../../../context/PurchasesContext';

const Header = () => {
  const [store, setStore] = useEditorStore();
  const {user} = usePurchases();

  const handleTogglePressed = () => {
    setStore({isEnabled: !store.isEnabled});
  };

  return (
    <View style={styles.headerContainer}>
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row'}}>
          <Label text="AOD" style={styles.heading} />
          <Label text=" Editor" style={styles.headingLight} />
          {user.pro && (
            <View style={styles.statusContainer}>
              <Label text="Pro" style={styles.proStatusText} />
            </View>
          )}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#eeea',
  },
  headingLight: {
    fontSize: 18,
    fontWeight: '200',
    color: '#eeea',
  },
  toggleContainer: {
    width: scale(40),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(-5),
    marginLeft: scale(5),
  },
  proStatusText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fc7',
  },
});

export default Header;
