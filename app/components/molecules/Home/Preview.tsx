import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
} from 'react-native';
import Label from '../../atoms/Label';
import {PREVIEW_IMAGE_RATIO} from '../../../constants/ui';
import {scale} from 'react-native-size-matters';
import {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useScreensStore} from '../../../services/mmkv';
import RNFS from 'react-native-fs';
import {IScreen} from '../../../models/OverlayModel';
import {getRenderedImagePath} from '../../../constants/paths';
import {EmptySlate} from '../../atoms/animations/EmptySlate';
import {GlareEffect} from '../../atoms/animations/GlareEffect';

interface IPreview {
  isScrolling: boolean;
  isSwiping: boolean;
  isApplied: boolean;
  item: IScreen;
  index: number;
  totalScreens: number;
  onPress: () => void;
}

enum PreviewState {
  LOADING,
  PREVIEW_EXISTS,
  NO_PREVIEW,
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
  const {height, width} = Dimensions.get('screen');
  const {screens} = useScreensStore();
  const [imageKey, setImageKey] = useState(Date.now());
  const decorationTimer = useRef<NodeJS.Timeout | null>(null);
  const checkPreviewTimer = useRef<NodeJS.Timeout | null>(null);
  const [showGlare, setShowGlare] = useState(false);
  const [previewState, setPreviewState] = useState(PreviewState.LOADING);
  const animatedScale = useRef(new Animated.Value(1)).current;
  const currentScaleRef = useRef(1);

  const previewPath = useMemo(
    () => getRenderedImagePath(item.id, 'aodpreview'),
    [item.id],
  );

  const handleImageError = useCallback(() => {
    setPreviewState(PreviewState.NO_PREVIEW);
  }, []);

  const checkPreviewExists = useCallback(async () => {
    try {
      const elementsLength = screens.screens[index].elements.length;
      const exists = await RNFS.exists(previewPath);

      const newState =
        exists && elementsLength > 0
          ? PreviewState.PREVIEW_EXISTS
          : PreviewState.NO_PREVIEW;

      setPreviewState(newState);
      if (exists) {
        setImageKey(Date.now());
      }
    } catch (error) {
      console.error('Error checking preview:', error);
      setPreviewState(PreviewState.NO_PREVIEW);
    }
  }, [previewPath, index, screens.screens]);

  // Cleanup function for timers
  const cleanupTimers = useCallback(() => {
    if (checkPreviewTimer.current) {
      clearTimeout(checkPreviewTimer.current);
      checkPreviewTimer.current = null;
    }
    if (decorationTimer.current) {
      clearTimeout(decorationTimer.current);
      decorationTimer.current = null;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPreviewState(PreviewState.LOADING);
      // Clear any existing timer before setting a new one
      if (checkPreviewTimer.current) {
        clearTimeout(checkPreviewTimer.current);
      }
      checkPreviewTimer.current = setTimeout(checkPreviewExists, 1000);

      return () => {
        cleanupTimers();
      };
    }, [checkPreviewExists, cleanupTimers]),
  );

  // Handle scale animation when scrolling
  useEffect(() => {
    const targetScale = isScrolling || isSwiping || !isApplied ? 0.96 : 1;
    const currentScale = currentScaleRef.current;
    const isScalingDown = targetScale < currentScale;
    
    Animated.timing(animatedScale, {
      toValue: targetScale,
      duration: isScalingDown ? 100 : 1000,
      useNativeDriver: true,
    }).start(() => {
      currentScaleRef.current = targetScale;
    });
  }, [isScrolling, isSwiping, isApplied, animatedScale]);

  // Handle glare effect when preview is applied
  useEffect(() => {
    if (
      isApplied &&
      !isScrolling &&
      !isSwiping &&
      previewState === PreviewState.PREVIEW_EXISTS
    ) {
      setShowGlare(true);
    } else {
      setShowGlare(false);
    }
  }, [isApplied, isScrolling, previewState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, [cleanupTimers]);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const previewContainerStyle = useMemo(
    () => [
      styles.previewContainer,
      {
        height: height * PREVIEW_IMAGE_RATIO,
        width: width * PREVIEW_IMAGE_RATIO,
        transform: [{scale: animatedScale}],
      },
    ],
    [height, width, animatedScale],
  );

  const headerContainerStyle = useMemo(
    () => [styles.headerContainer, {width: width * PREVIEW_IMAGE_RATIO}],
    [width],
  );

  const renderPreviewContent = useCallback(() => {
    if (previewState === PreviewState.NO_PREVIEW) {
      return (
        <View style={styles.noPreviewContainer}>
          <EmptySlate />
          <Label text="Customize your AOD" style={styles.noPreviewText} />
          <Label
            text="Tap the Edit button to get started"
            style={styles.noPreviewSubText}
          />
        </View>
      );
    }

    return (
      <View style={styles.previewImageContainer}>
        <Image
          source={{uri: `file://${previewPath}?t=${imageKey}`}}
          style={styles.previewImage}
          onError={handleImageError}
          resizeMode="contain"
        />
        <GlareEffect isVisible={showGlare} />
      </View>
    );
  }, [previewState, previewPath, imageKey, handleImageError, showGlare]);

  return (
    <View style={styles.bodyContainer}>
      <Animated.View style={headerContainerStyle}>
          <Label text={item.name} style={styles.headerText} />
        <View
          style={{
            backgroundColor: '#eee1',
            paddingHorizontal: scale(5),
            paddingVertical: scale(1),
            borderRadius: scale(10),
          }}>
          <Label
            text={`${index + 1} of ${totalScreens}`}
            style={{color: '#eee5', textAlign: 'center', fontSize: 8}}
          />
        </View>
      </Animated.View>
      <TouchableOpacity activeOpacity={1} onPress={handlePress}>
        <Animated.View style={previewContainerStyle}>
          {renderPreviewContent()}
        </Animated.View>
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
    backgroundColor: '#000',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  headerText: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: 'bold',
  },
  previewImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPreviewContainer: {
    position: 'absolute',
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
