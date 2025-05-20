import React, {useEffect, useRef} from 'react';
import {View, StatusBar, Animated} from 'react-native';
import StatusBarView from '../components/atoms/StatusBarView';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import EditorHeader from '../components/molecules/Editor/Header';
import {EDIT_WINDOW_RATIO} from '../constants/ui';
import RightPanel from '../components/molecules/Editor/RightPanel';
import LeftPanel from '../components/molecules/Editor/LeftPanel';
import BottomPanel from '../components/molecules/Editor/BottomPanel';
import Editor from '../components/molecules/Editor/Editor';
import {EditorProvider} from '../context/EditorContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {captureRef} from 'react-native-view-shot';
const EditorScreen: React.FC = () => {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [editorBorderWidth, setEditorBorderWidth] = React.useState(1);
  const animatedSize = useRef(new Animated.Value(EDIT_WINDOW_RATIO)).current;
  const panValues = useRef<{[key: string]: Animated.ValueXY}>({}).current;
  const ref = useRef<View>(null);

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

  const saveEditorImage = () => {
    setEditorBorderWidth(0);
    setTimeout(() => {
      captureRef(ref, {
        format: 'jpg',
        quality: 0.8,
      })
        .then(
          uri => console.log('Image saved to', uri),
          error => console.error('Oops, snapshot failed', error),
        )
        .finally(() => {
          setEditorBorderWidth(1);
        });
    }, 100);
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <EditorProvider>
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
              <EditorHeader saveImage={saveEditorImage} />
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
            {!isZoomed && <RightPanel animatedSize={animatedSize} />}
          </View>

          {!isZoomed && <BottomPanel panValues={panValues} />}
        </View>
      </EditorProvider>
    </GestureHandlerRootView>
  );
};

export default EditorScreen;
