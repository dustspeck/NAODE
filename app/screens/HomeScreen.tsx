import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  NativeModules,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PermissionStatus from '../components/molecules/PermissionsStatus';
import {scale} from 'react-native-size-matters';
import StatusBarView from '../components/atoms/StatusBarView';
import {FlatList} from 'react-native';
import FabButton from '../components/atoms/FabButton';
import PageIndicator from '../components/atoms/PageIndicator';
import Preview from '../components/molecules/Home/Preview';
import {useEditorStore, useScreensStore} from '../services/mmkv';
import Header from '../components/molecules/Home/Header';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {screens, setScreens} = useScreensStore();
  const [_store, setStore] = useEditorStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isApplied, setIsApplied] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {OverlayModule} = NativeModules;
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleEditPress = () => {
    navigation.navigate('Editor', {screenIndex: selectedIndex});
  };

  const handleLockPress = () => {
    OverlayModule.lockScreen();
  };

  const handleScrollBeginDrag = () => {
    OverlayModule.triggerTickHaptic();
    setIsScrolling(true);
    setIsSwiping(true);
  };

  const handleScrollEndDrag = () => {
    setIsSwiping(false);
  };

  const handleScrollEnd = () => {
    setIsScrolling(false);
    setIsApplied(false);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      OverlayModule.triggerTickHaptic();
      setStore({elements: screens.screens[selectedIndex].elements});
      setIsApplied(true);
    }, 1000);
  };

  const onFlatListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / scale(320));
    setSelectedIndex(index);
    setScreens({
      ...screens,
      selectedIndex: index,
    });
  };

  useEffect(() => {
    if (isApplied && !isScrolling && !isSwiping) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [isApplied, isScrolling, isSwiping]);

  return (
    <View style={styles.mainContainer}>
      <StatusBarView color="black" />
      <Header />
      <PermissionStatus />

      <FlatList
        data={screens.screens}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <Preview
            item={item}
            index={index}
            totalScreens={screens.screens.length}
            isScrolling={isScrolling}
            isSwiping={isSwiping}
            isApplied={isApplied}
          />
        )}
        initialScrollIndex={screens.selectedIndex}
        getItemLayout={(_data, index) => ({
          length: scale(320),
          offset: scale(320) * index,
          index,
        })}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{alignSelf: 'flex-start'}}
        snapToInterval={scale(320)}
        snapToAlignment="center"
        disableIntervalMomentum
        decelerationRate={'fast'}
        onScroll={onFlatListScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleScrollEnd}
      />

      <View style={styles.fabContainer}>
        <View style={styles.fabSecondaryContainer}>
          <FabButton
            isDisabled={isLoading}
            icon="bag-add"
            isPrimary={false}
            onPress={() => {}}
          />
          <FabButton
            isDisabled={isLoading}
            icon="lock-closed"
            isPrimary={false}
            onPress={handleLockPress}
          />
        </View>
        <FabButton
          isDisabled={isLoading}
          icon="brush"
          onPress={handleEditPress}
        />
      </View>
      <PageIndicator
        selectedIndex={selectedIndex}
        dataLength={screens.screens.length}
      />
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
