import React, {useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  Animated,
  ToastAndroid,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  DEFAULT_TEXT_VALUE,
  EDIT_CONTROLS_RATIO,
  getImageLibraryOptions,
  getUserImageURI,
} from '../../../constants/ui';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useEditorContext} from '../../../context/EditorContext';
import ControlIcon from '../../atoms/ControlIcon';
import RightPanelOverhead from '../../atoms/RightPanelOverhead';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';
import {updateScreen} from '../../../utils/common';
import {useScreensStore} from '../../../services/mmkv';
import {useEditorStore} from '../../../services/mmkv';
import {USER_IMAGES_PATH} from '../../../constants/paths';
import {copyImage, ensureDirectoryExists} from '../../../utils/storage';
import {EditorStarterCue} from '../../atoms/animations/EditorStarterCue';
import {createError, handleError} from '../../../utils/errorHandling';

interface RightPanelProps {
  animatedSize: Animated.Value;
  saveImage: (
    id: string,
    callback?: (path: string | null) => void,
    saveToGallery?: boolean,
  ) => void;
  screenIndex: number;
}

const RightPanel: React.FC<RightPanelProps> = ({
  animatedSize,
  saveImage,
  screenIndex,
}) => {
  const {width, height} = useWindowDimensions();
  const {
    handleAddImage,
    elements,
    selectedElementId,
    handleAddText,
    setSelectedElementId,
  } = useEditorContext();
  const [_store, setStore] = useEditorStore();
  const {screens, setScreens} = useScreensStore();
  const [isAddSelected, setIsAddSelected] = useState(false);
  const [isSaveSelected, setIsSaveSelected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToPath, setSavedToPath] = useState<string | null>(null);
  const [hasElements, setHasElements] = useState(false);

  useEffect(() => {
    if (selectedElementId === null) {
      deselectAll();
    }
  }, [selectedElementId]);

  useEffect(() => {
    setHasElements(elements.length > 0);
  }, [elements]);

  const onAddImage = async () => {
    launchImageLibrary(getImageLibraryOptions(), async response => {
      if (response.didCancel) {
        ToastAndroid.show('No image selected', ToastAndroid.SHORT);
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        try {
          await ensureDirectoryExists(USER_IMAGES_PATH);
          const newPath = getUserImageURI(response.assets[0].uri);
          await copyImage(response.assets[0].uri, newPath);
          handleAddImage(newPath);
        } catch (error) {
          console.error('Error copying image:', error);
          ToastAndroid.show('Error saving image', ToastAndroid.SHORT);
        }
      }
    });
    setIsAddSelected(false);
  };

  const onAddImageFromCamera = async () => {
    launchCamera(getImageLibraryOptions(), async response => {
      if (response.didCancel) {
        ToastAndroid.show('No image captured', ToastAndroid.SHORT);
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        try {
          await ensureDirectoryExists(USER_IMAGES_PATH);
          const newPath = getUserImageURI(response.assets[0].uri);
          await copyImage(response.assets[0].uri, newPath);
          handleAddImage(newPath);
        } catch (error) {
          console.error('Error copying image:', error);
          ToastAndroid.show('Error saving image', ToastAndroid.SHORT);
        }
      }
    });
    setIsAddSelected(false);
  };

  const onAddText = () => {
    handleAddText(DEFAULT_TEXT_VALUE);
    setIsAddSelected(false);
  };

  const handleSaveImage = () => {
    try {
      setIsSaving(true);
      setSelectedElementId(null);
      setStore({elements});
      setScreens(updateScreen(screens.screens, screenIndex, elements));
      saveImage(
        screens.screens[screenIndex].id,
        path => {
          setSavedToPath(path);
          setIsSaving(false);
          ToastAndroid.show('Image saved to gallery', ToastAndroid.SHORT);
        },
        true,
      );
    } catch (error) {
      setIsSaving(false);
      ToastAndroid.show('Failed to save image to gallery', ToastAndroid.SHORT);
      handleError(
        error,
        'RightPanel:handleSaveImage',
        createError('Failed to save image to gallery', 'EDITOR_SAVE_ERROR', {
          id: screens.screens[screenIndex].id,
        }),
      );
    }
  };

  const handleSavePress = () => {
    deselectAll();
    if (!isSaveSelected) {
      setIsSaveSelected(true);
      handleSaveImage();
    } else {
      setIsSaveSelected(false);
    }
  };

  const handleAddPress = () => {
    deselectAll();
    setIsAddSelected(!isAddSelected);
  };

  const deselectAll = () => {
    setIsAddSelected(false);
    setIsSaveSelected(false);
  };

  return (
    <View style={{backgroundColor: '#0c0c0c'}}>
      <Animated.View
        style={{
          width: width * EDIT_CONTROLS_RATIO,
          height: animatedSize.interpolate({
            inputRange: [0, 1],
            outputRange: [0, height],
          }),
          alignItems: 'center',
          gap: scale(12),
        }}>
        {isAddSelected && (
          <RightPanelOverhead>
            <Label text="Add new" style={{color: '#eee', fontSize: scale(5)}} />
            <ControlIcon name="text-outline" onPress={onAddText} label="Text" />
            <View style={{flexDirection: 'row', gap: scale(10)}}>
              <ControlIcon
                labelStyle={{width: scale(50)}}
                name="camera-outline"
                onPress={onAddImageFromCamera}
                label="Capture"
              />
              <ControlIcon
                isPremium
                name="image-outline"
                onPress={onAddImage}
                label="Gallery"
              />
            </View>
          </RightPanelOverhead>
        )}
        {isSaveSelected && (
          <RightPanelOverhead>
            <Label
              text="Save image"
              style={{color: '#eee', fontSize: scale(5)}}
            />
            {isSaving ? (
              <View style={{gap: scale(5)}}>
                <ActivityIndicator size="small" color="#fff" />
                <Label text="Saving" />
              </View>
            ) : (
              <View style={{gap: scale(5), flex: 1, justifyContent: 'center'}}>
                <Label text="Saved at " />
                {savedToPath && (
                  <Label
                    text={savedToPath}
                    style={{
                      color: '#eee',
                      fontSize: scale(6),
                      fontFamily: 'monospace',
                      backgroundColor: '#222',
                      padding: scale(4),
                      borderRadius: scale(4),
                    }}
                  />
                )}
              </View>
            )}
          </RightPanelOverhead>
        )}
        {!hasElements && !isAddSelected && !isSaveSelected && (
          <EditorStarterCue />
        )}
        <ControlIcon
          name="add-circle"
          onPress={handleAddPress}
          isSelected={isAddSelected}
          label="Add"
          iconRatio={0.6}
        />
        <ControlIcon
          isDisabled={!hasElements}
          name="download-outline"
          onPress={handleSavePress}
          isSelected={isSaveSelected}
          label="Save image"
        />
      </Animated.View>
    </View>
  );
};

export default RightPanel;
