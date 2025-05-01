import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  View,
  StatusBar,
  Animated,
} from 'react-native';
import Label from './app/components/atoms/Label';
import StatusBarView from './app/components/atoms/StatusBarView';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import EditorHeader from './app/components/molecules/Editor/Header';
import {EDIT_CONTROLS_RATIO, EDIT_WINDOW_RATIO} from './app/constants/ui';
import RightPanel from './app/components/molecules/Editor/RightPanel';
import LeftPanel from './app/components/molecules/Editor/LeftPanel';
import BottomPanel from './app/components/molecules/Editor/BottomPanel';
import Editor from './app/components/molecules/Editor/Editor';

function App(): React.JSX.Element {
  const {width, height} = useWindowDimensions();

  const [isZoomed, setIsZoomed] = useState(false);
  const animatedSize = useRef(new Animated.Value(EDIT_WINDOW_RATIO)).current;

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

  return (
    <SafeAreaView style={{flex: 1}}>
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
            <EditorHeader />
          </>
        )}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {!isZoomed && <LeftPanel animatedSize={animatedSize} />}
          <Editor
            animatedSize={animatedSize}
            isZoomed={isZoomed}
            setIsZoomed={setIsZoomed}
          />
          {!isZoomed && <RightPanel animatedSize={animatedSize} />}
        </View>

        {!isZoomed && <BottomPanel />}
      </View>
    </SafeAreaView>
  );
}

export default App;
