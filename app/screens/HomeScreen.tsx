import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  NativeModules,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import PermissionStatus from '../components/molecules/PermissionsStatus';
import Label from '../components/atoms/Label';
import {scale} from 'react-native-size-matters';
import StatusBarView from '../components/atoms/StatusBarView';
import Toggle from '../components/atoms/Toggle';
import RNFS from 'react-native-fs';
import {PREVIEW_IMAGE_RATIO} from '../constants/ui';
import Icon from 'react-native-vector-icons/Ionicons';
import {useEditorStore} from '../services/mmkv';
import {FlatList} from 'react-native';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [previewExists, setPreviewExists] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {width, height} = useWindowDimensions();
  const {store} = useEditorStore();
  const {OverlayModule} = NativeModules;
  const previewPath = `${RNFS.DocumentDirectoryPath}/aod/aodpreview.jpg`;

  const checkPreviewExists = async () => {
    try {
      const elementsLength = store.elements.length;
      const exists = await RNFS.exists(previewPath);
      setPreviewExists(exists && elementsLength > 0);
      if (exists) {
        setImageKey(Date.now()); // Force image reload
      }
    } catch (error) {
      console.error('Error checking preview:', error);
      setPreviewExists(false);
    }
  };

  useEffect(() => {
    checkPreviewExists();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        checkPreviewExists();
      }, 1000);

      return () => clearTimeout(timer);
    }, [store.elements]),
  );

  const handleEditPress = () => {
    navigation.navigate('Editor');
  };

  const handleLockPress = () => {
    console.log('lock screen');
    OverlayModule.lockScreen();
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

  interface IPreview {
    heading: string;
  }

  const Preview = ({heading}: IPreview) => {
    return (
      <View style={styles.bodyContainer}>
        <Label text={heading} style={{fontSize: 12}} />
        <View
          style={[
            styles.previewContainer,
            {
              height: height * PREVIEW_IMAGE_RATIO,
              width: width * PREVIEW_IMAGE_RATIO,
            },
          ]}>
          {previewExists ? (
            <Image
              key={imageKey}
              source={{uri: `file://${previewPath}?t=${imageKey}`}}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noPreviewContainer}>
              <Icon name="brush" size={scale(20)} color="#eee5" />
              <Label text="Customize your AOD" style={styles.noPreviewText} />
              <Label
                text="Tap the Edit button to get started"
                style={styles.noPreviewSubText}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const getPageIndicatorColor = (
    index: number,
    selectedIndex: number,
    dataLength: number,
  ) => {
    switch (index) {
      case 0:
        return selectedIndex === 0 ? '#aaa' : '#555';
      case 2:
        return selectedIndex === dataLength - 1 ? '#aaa' : '#555';
      default:
        return selectedIndex > 0 && selectedIndex < dataLength - 1
          ? '#aaa'
          : '#555';
    }
  };

  const PageIndicator = ({
    selectedIndex,
    dataLength,
  }: {
    selectedIndex: number;
    dataLength: number;
  }) => {
    return (
      <View style={styles.pageIndicator}>
        <View style={{flexDirection: 'row', gap: scale(6)}}>
          {Array.from({length: 3}).map((_, index) => (
            <View
              key={index}
              style={{
                width: scale(4),
                height: scale(4),
                backgroundColor: getPageIndicatorColor(
                  index,
                  selectedIndex,
                  dataLength,
                ),
                borderRadius: scale(5),
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        margin: scale(15),
        marginHorizontal: scale(5),
        minHeight: '100%',
        backgroundColor: '#000',
        paddingHorizontal: scale(16),
        paddingBottom: scale(5),
      }}>
      <StatusBarView color="black" />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          alignContent: 'center',
          alignSelf: 'center',
        }}>
        <View style={{flex: 1}}>
          <Label text="NAODE" style={{fontSize: 24, fontWeight: 'bold'}} />
        </View>
        <View style={{width: scale(50)}}>
          <Toggle
            isEnabled={true}
            isLoading={false}
            onTogglePressed={()=>{}}
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
        onScroll={e => {
          const contentOffsetX = e.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffsetX / scale(320));
          setSelectedIndex(index);
        }}
      />

      <View style={styles.floatingBar}>
        <View style={{flexDirection: 'row', gap: scale(10)}}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {}}
            style={styles.secondaryFloatingButton}>
            <Icon name="bag-add" size={scale(16)} color="#aaa" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLockPress}
            style={styles.secondaryFloatingButton}>
            <Icon name="lock-closed" size={scale(16)} color="#aaa" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleEditPress}
          style={styles.primaryFloatingButton}>
          <Icon name="brush" size={scale(20)} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'row'}}>
        <PageIndicator selectedIndex={selectedIndex} dataLength={data.length} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bodyContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    width: scale(320),
  },
  previewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: scale(20),
    borderWidth: 1,
    borderColor: '#eee5',
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noPreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: scale(120),
    gap: scale(10),
  },
  noPreviewText: {
    fontSize: scale(10),
    color: '#eee5',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noPreviewSubText: {
    fontSize: scale(5),
    color: '#eee5',
    textAlign: 'center',
    fontWeight: 'normal',
  },
  floatingBar: {
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
  primaryFloatingButton: {
    height: scale(50),
    width: scale(50),
    backgroundColor: '#bbb',
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryFloatingButton: {
    height: scale(40),
    width: scale(40),
    backgroundColor: '#1e1e1e',
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: scale(120),
    left: scale(10),
    right: scale(10),
    alignItems: 'center',
    padding: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: scale(12),
  },
});

export default HomeScreen;
