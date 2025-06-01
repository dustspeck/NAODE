import React, {useEffect, useRef} from 'react';
import {View, StatusBar, Animated, Dimensions, PixelRatio} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import EditorHeader from '../components/molecules/Editor/Header';
import {
  EDIT_WINDOW_RATIO,
  getHighQualityImageProps,
  getPreviewImageProps,
} from '../constants/ui';
import RightPanel from '../components/molecules/Editor/RightPanel';
import LeftPanel from '../components/molecules/Editor/LeftPanel';
import BottomPanel from '../components/molecules/Editor/BottomPanel';
import Editor from '../components/molecules/Editor/Editor';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {captureRef} from 'react-native-view-shot';
import {AOD_IMAGE_PATH, getRenderedImagePath} from '../constants/paths';
import {handleError, createError} from '../utils/errorHandling';
import {measureAsync} from '../utils/performance';
import {saveImage, ensureDirectoryExists} from '../utils/storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface IEditorScreenProps {
  route: {
    params: {
      screenIndex: number;
    };
  };
}

const EditorScreen: React.FC<IEditorScreenProps> = ({route}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [editorBorderWidth, setEditorBorderWidth] = React.useState(1);
  const animatedSize = useRef(new Animated.Value(EDIT_WINDOW_RATIO)).current;
  const panValues = useRef<{[key: string]: Animated.ValueXY}>({}).current;
  const ref = useRef<View>(null);
  const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');
  const pixelRatio = PixelRatio.get();
  const exactWidth = Math.round(screenWidth * pixelRatio);
  const exactHeight = Math.round(screenHeight * pixelRatio);
  const screenIndex = route?.params?.screenIndex ?? 0;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isZoomed) {
      SystemNavigationBar.immersive();
      StatusBar.setHidden(true);
      Animated.spring(animatedSize, {
        toValue: 1,
        useNativeDriver: false,
        friction: 8,
        tension: 80,
      }).start();
    } else {
      SystemNavigationBar.navigationShow();
      StatusBar.setHidden(false);
      Animated.spring(animatedSize, {
        toValue: EDIT_WINDOW_RATIO,
        useNativeDriver: false,
        friction: 8,
        tension: 80,
      }).start();
    }
  }, [isZoomed]);

  const saveEditorImage = async (id: string, callback?: () => void) => {
    setEditorBorderWidth(0);
    try {
      await measureAsync('saveEditorImage', async () => {
        await ensureDirectoryExists(AOD_IMAGE_PATH);

        const highQualityUri = await captureRef(
          ref,
          getHighQualityImageProps(exactWidth, exactHeight),
        );
        const previewUri = await captureRef(
          ref,
          getPreviewImageProps(exactWidth, exactHeight),
        );

        const highQualityPath = getRenderedImagePath(id, 'aod');
        const previewPath = getRenderedImagePath(id, 'aodpreview');

        await saveImage(highQualityUri, highQualityPath);
        await saveImage(previewUri, previewPath);

        console.log(
          'Images saved to internal storage:',
          previewPath,
          highQualityPath,
        );

        if (callback) callback();
      });
    } catch (error) {
      handleError(
        error,
        'EditorScreen:saveEditorImage',
        createError('Failed to save editor images', 'EDITOR_SAVE_ERROR', {
          id,
          exactWidth,
          exactHeight,
          pixelRatio,
        }),
      );
    } finally {
      setEditorBorderWidth(1);
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar barStyle={'light-content'} />
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: insets.bottom,
        }}>
        {!isZoomed && (
          <>
            <EditorHeader
              saveImage={saveEditorImage}
              screenIndex={screenIndex}
            />
          </>
        )}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {!isZoomed && (
            <LeftPanel
              animatedSize={animatedSize}
              isZoomed={isZoomed}
              setIsZoomed={setIsZoomed}
            />
          )}
          <View ref={ref} collapsable={false}>
            <Editor
              animatedSize={animatedSize}
              isZoomed={isZoomed}
              setIsZoomed={setIsZoomed}
              panValues={panValues}
              editorBorderWidth={editorBorderWidth}
            />
          </View>
          {!isZoomed && (
            <RightPanel
              animatedSize={animatedSize}
              saveImage={saveEditorImage}
              screenIndex={screenIndex}
            />
          )}
        </View>

        {!isZoomed && <BottomPanel panValues={panValues} />}
      </View>
    </GestureHandlerRootView>
  );
};

export default EditorScreen;
