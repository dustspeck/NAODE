import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TouchableOpacity, useWindowDimensions, View} from 'react-native';
import IconPill from '../components/atoms/IconPill';
import {scale} from 'react-native-size-matters';
import {Icon} from 'react-native-vector-icons/Icon';
import Label from '../components/atoms/Label';
import {EDIT_CONTROLS_RATIO} from '../constants/ui';

type ShopScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const ShopScreen: React.FC<ShopScreenProps> = ({navigation}) => {
  const {width, height} = useWindowDimensions();
  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: scale(10),
        marginTop: scale(20),
      }}>
      <View style={{width: scale(50)}}>
        <IconPill
          icon="chevron-back"
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
      <Label
        text="Settings"
        style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}
      />
      <View style={{width: scale(50)}}>
        <IconPill onPress={() => {}} icon="checkmark" />
      </View>
    </View>
  );
};

export default ShopScreen;
