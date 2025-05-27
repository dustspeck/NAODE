import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  ToastAndroid,
  useWindowDimensions,
  View,
} from 'react-native';
import {DEFAULT_TEXT_VALUE, EDIT_CONTROLS_RATIO, getImageLibraryOptions, getUserImageURI} from '../../../constants/ui';
import {launchImageLibrary} from 'react-native-image-picker';
import {useEditorContext} from '../../../context/EditorContext';
import ControlIcon from '../../atoms/ControlIcon';
import RightPanelOverhead from '../../atoms/RightPanelOverhead';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';
import {updateScreen} from '../../../utils/common';
import {useScreensStore} from '../../../services/mmkv';
import {useEditorStore} from '../../../services/mmkv';
import {
  GALLERY_IMAGE_PATH,
  getGalleryImagePath,
  getRenderedImagePath,
  USER_IMAGES_PATH,
} from '../../../constants/paths';
import {IScreen} from '../../../models/OverlayModel';
import { copyImage, ensureDirectoryExists } from '../../../utils/storage';

interface RightPanelProps {
  animatedSize: Animated.Value;
  saveImage: (id: string, callback?: () => void) => void;
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

  useEffect(() => {
    if (selectedElementId === null) {
      deselectAll();
    }
  }, [selectedElementId]);

  const onAddImage = async () => {
    launchImageLibrary(
      getImageLibraryOptions(),
      async response => {
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
      },
    );
    setIsAddSelected(false);
  };

  const onAddText = () => {
    handleAddText(DEFAULT_TEXT_VALUE);
    setIsAddSelected(false);
  };

  const saveImageToGallery = async (screen: IScreen) => {
    try {
      await ensureDirectoryExists(GALLERY_IMAGE_PATH);
      const imagePath = getRenderedImagePath(screen.id, 'aod');
      const outputPath = getGalleryImagePath(screen.id);
      await copyImage(imagePath, outputPath);
      ToastAndroid.show('Image saved to gallery', ToastAndroid.SHORT);
      console.log('Image saved to gallery', outputPath);
      setSavedToPath(outputPath);
      return true;
    } catch (error) {
      console.log('Error saving image to gallery', error);
      ToastAndroid.show('Error saving image to gallery', ToastAndroid.SHORT);
      return false;
    }
  };

  const handleSaveImage = () => {
    setIsSaving(true);
    setSelectedElementId(null);
    setStore({elements});
    setScreens(updateScreen(screens.screens, screenIndex, elements));
    saveImage(screens.screens[screenIndex].id, () => {
      saveImageToGallery(screens.screens[screenIndex]);
      setIsSaving(false);
    });
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
    <View>
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
            <View style={{flexDirection: 'row', gap: scale(10)}}>
              <ControlIcon
                name="text-outline"
                onPress={onAddText}
                label="Text"
              />
              <ControlIcon
                name="image-outline"
                onPress={onAddImage}
                label="Image"
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
        <ControlIcon
          name="add-circle"
          onPress={handleAddPress}
          isSelected={isAddSelected}
          label="Add"
          iconRatio={0.6}
        />
        <ControlIcon
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
