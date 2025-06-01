import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Label from '../../atoms/Label';
import {PREVIEW_IMAGE_RATIO} from '../../../constants/ui';
import {scale} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import {useEffect, useRef, useState} from 'react';
import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useEditorStore} from '../../../services/mmkv';
import RNFS from 'react-native-fs';
import {IScreen} from '../../../models/OverlayModel';
import {getRenderedImagePath} from '../../../constants/paths';

interface IPreview {
  isScrolling: boolean;
  isSwiping: boolean;
  isApplied: boolean;
  item: IScreen;
  index: number;
  totalScreens: number;
  onPress: () => void;
}

const Preview = ({
  isScrolling,
  isSwiping,
  isApplied,
  item,
  index,
  totalScreens,
  onPress,
}: IPreview) => {
  const {height, width} = useWindowDimensions();
  const [store] = useEditorStore();

  const [previewExists, setPreviewExists] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const decorationTimer = useRef<NodeJS.Timeout | null>(null);
  const [decorationVisible, setDecorationVisible] = useState(true);

  const previewPath = getRenderedImagePath(item.id, 'aodpreview');

  const checkPreviewExists = async () => {
    try {
      const elementsLength = store.elements.length;
      const exists = await RNFS.exists(previewPath);
      setPreviewExists(exists && elementsLength > 0);
      if (exists) setImageKey(Date.now());
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

  useEffect(() => {
    if (isScrolling) {
      setDecorationVisible(true);
    }
    if (decorationTimer.current) {
      clearTimeout(decorationTimer.current);
    }
    decorationTimer.current = setTimeout(() => {
      setDecorationVisible(false);
    }, 800);
    return () => {
      if (decorationTimer.current) {
        clearTimeout(decorationTimer.current);
      }
    };
  }, [isScrolling]);

  return (
    <View style={styles.bodyContainer}>
      {(decorationVisible || isScrolling) && (
        <View
          style={{
            position: 'absolute',
            left: scale(20),
            top: 0,
            height: height * PREVIEW_IMAGE_RATIO,
            justifyContent: 'center',
          }}>
          <Label
            text={`${index + 1} of ${totalScreens}`}
            style={{
              transform: [{rotate: '-90deg'}],
              color: '#eee5',
              textAlign: 'center',
            }}
          />
        </View>
      )}
      <View
        style={[styles.headerContainer, {width: width * PREVIEW_IMAGE_RATIO}]}>
        <Label text={item.name} style={styles.headerText} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(2),
            backgroundColor: !isApplied || isScrolling ? '#333' : '#14452f',
            paddingHorizontal: scale(5),
            paddingRight: !isApplied || isScrolling ? scale(10) : scale(7),
            paddingLeft: !isApplied || isScrolling ? scale(10) : scale(5),
            paddingVertical: scale(1),
            borderRadius: scale(10),
          }}>
          {isApplied && !isScrolling && (
            <Icon name="checkmark" size={scale(10)} color="#caffbf" />
          )}
          <Label
            text={
              isScrolling ? 'Selecting' : isApplied ? 'Applied' : 'Applying'
            }
            style={{
              fontSize: 8,
              color: isApplied && !isScrolling ? '#caffbf' : '#aaa',
            }}
          />
        </View>
      </View>
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
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
      </TouchableOpacity>
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
    marginBottom: scale(20),
    marginTop: scale(10),
    borderWidth: 3,
    borderColor: '#6665',
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  headerText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: 'bold',
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
