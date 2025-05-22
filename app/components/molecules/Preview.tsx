import {Image, NativeModules, StyleSheet, View, useWindowDimensions} from 'react-native';
import Label from '../atoms/Label';
import {PREVIEW_IMAGE_RATIO} from '../../constants/ui';
import {scale} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useEditorStore } from '../../services/mmkv';
import RNFS from 'react-native-fs';
interface IPreview {
  heading: string;
}

const Preview = ({heading}: IPreview) => {
  const {height, width} = useWindowDimensions();
  const {store} = useEditorStore();
  const {OverlayModule} = NativeModules;
  const previewPath = `${RNFS.DocumentDirectoryPath}/aod/aodpreview.jpg`;
  const [previewExists, setPreviewExists] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

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
});

export default Preview;
