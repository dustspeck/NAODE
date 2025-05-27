import React, {useEffect, useRef} from 'react';
import {View, StatusBar, Animated, Dimensions} from 'react-native';
import StatusBarView from '../components/atoms/StatusBarView';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import EditorHeader from '../components/molecules/Editor/Header';
import {EDIT_WINDOW_RATIO, PREVIEW_IMAGE_RATIO} from '../constants/ui';
import RightPanel from '../components/molecules/Editor/RightPanel';
import LeftPanel from '../components/molecules/Editor/LeftPanel';
import BottomPanel from '../components/molecules/Editor/BottomPanel';
import Editor from '../components/molecules/Editor/Editor';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {captureRef} from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { AOD_IMAGE_PATH } from '../constants/paths';

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
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const screenIndex = route?.params?.screenIndex ?? 0;

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
      // Create internal files directory if it doesn't exist
      const internalDir = AOD_IMAGE_PATH;
      const exists = await RNFS.exists(internalDir);
      if (!exists) {
        await RNFS.mkdir(internalDir);
      }

      // Capture high quality image
      const highQualityUri = await captureRef(ref, {
        format: 'jpg',
        quality: 1,
        width: screenWidth,
        height: screenHeight,
      });

      // Capture preview image
      const previewUri = await captureRef(ref, {
        format: 'jpg',
        quality: 0.8,
        width: screenWidth * PREVIEW_IMAGE_RATIO,
        height: screenHeight * PREVIEW_IMAGE_RATIO,
      });

      // Move files to internal directory
      const highQualityPath = `${internalDir}/aod_${id}.jpg`;
      const previewPath = `${internalDir}/aodpreview_${id}.jpg`;

      await RNFS.moveFile(highQualityUri, highQualityPath);
      await RNFS.moveFile(previewUri, previewPath);

      console.log('Images saved to internal storage:', {
        highQuality: highQualityPath,
        preview: previewPath,
      });

      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Error saving images:', error);
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
        }}>
        {!isZoomed && (
          <>
            <StatusBarView color="black" />
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
