import {StyleSheet, Text, View} from 'react-native';
import Toggle from '../../atoms/Toggle';
import {scale} from 'react-native-size-matters';
import Label from '../../atoms/Label';

const Header = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row'}}>
          {/* <Label text="AOD" style={{fontSize: 24, fontWeight: 'bold'}} />
          <Label text="itore." style={{fontSize: 24, fontWeight: '200'}} /> */}
          <Label text="Aodes" style={{fontSize: 24, fontWeight: 'bold'}} />
          <Label text="ign." style={{fontSize: 24, fontWeight: '200'}} />
        </View>
      </View>
      <View style={{width: scale(40)}}>
        <Toggle
          isEnabled
          isLoading={false}
          onTogglePressed={() => {}}
          isImportant
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
