import React, {useEffect, useRef} from 'react';
import {View, StatusBar, Animated, Dimensions, PixelRatio, NativeModules} from 'react-native';
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
import RNFS from 'react-native-fs';

const {OverlayModule} = NativeModules;

interface IEditorScreenProps {
  route: {
    params: {
      screenIndex: number;
    };
  };
}

const createCheckerboardPattern = async (uri: string, cellSize: number = 1): Promise<string> => {
  try {
    const tempPath = `${RNFS.CachesDirectoryPath}/temp_${Date.now()}.png`;
    const processedPath = await OverlayModule.createCheckerboardPattern(uri, cellSize);

    await new Promise(resolve => setTimeout(resolve, 100));

    const exists = await RNFS.exists(processedPath);
    if (!exists) throw new Error(`Processed file not found at ${processedPath}`);

    await RNFS.copyFile(processedPath, tempPath);
    const tempExists = await RNFS.exists(tempPath);
    if (!tempExists) throw new Error(`Failed to copy file to ${tempPath}`);

    if (await RNFS.exists(processedPath)) await RNFS.unlink(processedPath);
    
    return `file://${tempPath}`;
  } catch (error) {
    handleError(
      error,
      'EditorScreen:createCheckerboardPattern',
      createError('Failed to create checkerboard pattern', 'IMAGE_PROCESSING_ERROR', {uri}),
    );
    throw error;
  }
};

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

        const optimizedHighQualityUri = await createCheckerboardPattern(highQualityUri);
        await saveImage(optimizedHighQualityUri, highQualityPath);
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
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: insets.bottom,
          backgroundColor: '#000',
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
