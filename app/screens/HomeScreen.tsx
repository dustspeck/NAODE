import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  NativeModules,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PermissionStatus from '../components/molecules/PermissionsStatus';
import Label from '../components/atoms/Label';
import {scale} from 'react-native-size-matters';
import StatusBarView from '../components/atoms/StatusBarView';
import Toggle from '../components/atoms/Toggle';
import {FlatList} from 'react-native';
import FabButton from '../components/atoms/FabButton';
import PageIndicator from '../components/atoms/PageIndicator';
import Preview from '../components/molecules/Preview';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {OverlayModule} = NativeModules;

  const handleEditPress = () => {
    navigation.navigate('Editor');
  };

  const handleLockPress = () => {
    console.log('lock screen');
    OverlayModule.lockScreen();
  };

  const onFlatListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / scale(320));
    setSelectedIndex(index);
  };

  const data = [
    {
      heading: 'Custom',
    },
    {
      heading: 'Water',
    },
    {
      heading: 'Earth',
    },
    {
      heading: 'Fire',
    },
    {
      heading: 'Air',
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBarView color="black" />
      <View style={styles.headerContainer}>
        <View style={{flex: 1}}>
          <Label text="NAODE" style={{fontSize: 24, fontWeight: 'bold'}} />
        </View>
        <View style={{width: scale(50)}}>
          <Toggle
            isEnabled={true}
            isLoading={false}
            onTogglePressed={() => {}}
          />
        </View>
      </View>

      <PermissionStatus />

      <FlatList
        data={data}
        renderItem={({item}) => <Preview heading={item.heading} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{alignSelf: 'flex-start'}}
        snapToInterval={scale(320)}
        snapToAlignment="center"
        disableIntervalMomentum
        decelerationRate={'fast'}
        onScroll={onFlatListScroll}
      />

      <View style={styles.fabContainer}>
        <View style={styles.fabSecondaryContainer}>
          <FabButton icon="bag-add" isPrimary={false} onPress={() => {}} />
          <FabButton
            icon="lock-closed"
            isPrimary={false}
            onPress={handleLockPress}
          />
        </View>
        <FabButton icon="brush" onPress={handleEditPress} />
      </View>
      <PageIndicator selectedIndex={selectedIndex} dataLength={data.length} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    margin: scale(15),
    marginHorizontal: scale(5),
    minHeight: '100%',
    backgroundColor: '#000',
    paddingHorizontal: scale(16),
    paddingBottom: scale(5),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  fabContainer: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: scale(40),
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    padding: scale(10),
    justifyContent: 'space-between',
    gap: scale(10),
  },
  fabSecondaryContainer: {
    flexDirection: 'row',
    gap: scale(10),
  },
});

export default HomeScreen;
