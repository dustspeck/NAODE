import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  NativeModules,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Easing,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PermissionStatus from '../components/molecules/PermissionsStatus';
import {scale} from 'react-native-size-matters';
import {FlatList} from 'react-native';
import FabButton from '../components/atoms/FabButton';
import PageIndicator from '../components/atoms/PageIndicator';
import Preview from '../components/molecules/Home/Preview';
import {useEditorStore, useScreensStore} from '../services/mmkv';
import Header from '../components/molecules/Home/Header';
import BrightnessSliderModal from '../components/molecules/Home/BrightnessSliderModal';
import {PREVIEW_WIDTH} from '../constants/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [isBrightnessModalVisible, setIsBrightnessModalVisible] =
    useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const {OverlayModule} = NativeModules;
  const timer = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();

  const startShakeAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 8,
        duration: 30,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -8,
        duration: 30,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 8,
        duration: 30,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 30,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ]).start();
  }, [shakeAnimation]);

  const handleEditPress = () => {
    navigation.navigate('Editor', {screenIndex: selectedIndex});
  };

  const handleLockPress = () => {
    OverlayModule.lockScreen();
  };

  const handleBrightnessPress = () => {
    setIsBrightnessModalVisible(true);
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
    const index = Math.round(contentOffsetX / PREVIEW_WIDTH);

    if (index !== selectedIndex) {
      setSelectedIndex(index);
      setScreens({
        ...screens,
        selectedIndex: index,
      });
    }
  };

  useEffect(() => {
    if (isApplied && !isScrolling && !isSwiping) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [isApplied, isScrolling, isSwiping]);

  return (
    <View
      style={[
        styles.mainContainer,
        {paddingBottom: insets.bottom + scale(5), paddingTop: insets.top},
      ]}>
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
            onPress={startShakeAnimation}
          />
        )}
        initialScrollIndex={screens.selectedIndex}
        getItemLayout={(_data, index) => ({
          length: PREVIEW_WIDTH,
          offset: PREVIEW_WIDTH * index,
          index,
        })}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{alignSelf: 'flex-start'}}
        snapToInterval={PREVIEW_WIDTH}
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
            icon="lock-closed"
            isPrimary={false}
            onPress={handleLockPress}
          />
          <FabButton
            isDisabled={isLoading}
            icon="sunny"
            isPrimary={false}
            onPress={handleBrightnessPress}
          />
          <FabButton
            isDisabled={isLoading}
            icon="ellipsis-horizontal"
            isPrimary={false}
            onPress={() => {
              navigation.navigate('Shop');
            }}
          />
        </View>
        <Animated.View
          style={{
            transform: [{translateX: shakeAnimation}],
          }}>
          <FabButton
            isDisabled={isLoading}
            icon="brush"
            onPress={handleEditPress}
          />
        </Animated.View>
      </View>
      <PageIndicator
        selectedIndex={selectedIndex}
        dataLength={screens.screens.length}
      />
      <BrightnessSliderModal
        isVisible={isBrightnessModalVisible}
        setIsVisible={setIsBrightnessModalVisible}
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
