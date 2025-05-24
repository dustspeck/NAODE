import {TouchableOpacity, View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import IconPill from '../../atoms/IconPill';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';
import {useEditorContext} from '../../../context/EditorContext';
import {useEditorStore, useScreensStore} from '../../../services/mmkv';
import {
  debounce,
  isEqual,
  renameScreen,
  updateScreen,
} from '../../../utils/common';
import {useCallback, useEffect, useMemo, useState} from 'react';
import ModalWindow from '../ModalWindow';
import ActionButton from '../../atoms/ActionButton';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeModules} from 'react-native';
import TextBox from '../../atoms/TextBox';

const {OverlayModule} = NativeModules;

interface IHeaderProps {
  saveImage: (id: string) => void;
  screenIndex: number;
}

const EditorHeader: React.FC<IHeaderProps> = ({saveImage, screenIndex}) => {
  const {width, height} = useWindowDimensions();
  const navigation = useNavigation();
  const {elements, setSelectedElementId} = useEditorContext();
  const [store, setStore] = useEditorStore();
  const {screens, setScreens} = useScreensStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingState, setIsSavingState] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newName, setNewName] = useState('Unnamed');
  const [preName, setPreName] = useState('Unnamed');

  useEffect(() => {
    try {
      setNewName(screens.screens[screenIndex].name);
    } catch (error) {
      setNewName('Unnamed');
    }
  }, [screenIndex, screens.screens]);

  const headingText = useMemo(() => {
    return newName.length > 10 ? newName.slice(0, 18) + '...' : newName;
  }, [newName]);

  const checkForChange = useMemo(
    () =>
      debounce(() => {
        if (!isEqual(elements, store.elements)) {
          setHasUnsavedChanges(true);
        } else {
          setHasUnsavedChanges(false);
        }
      }, 300),
    [elements, store.elements],
  );

  const handleSaveModal = () => {
    OverlayModule.triggerTickHaptic();
    setIsSaveModalVisible(!isSaveModalVisible);
  };

  const handleRenameModal = () => {
    setPreName(newName);
    setIsRenameModalVisible(!isRenameModalVisible);
  };

  const saveChanges = useCallback(() => {
    setSelectedElementId(null);
    setIsSavingState(true);
    setStore({elements});
    setScreens(updateScreen(screens.screens, screenIndex, elements));
    saveImage(screens.screens[screenIndex].id);
    setIsSaveModalVisible(false);
    setTimeout(() => {
      setIsSavingState(false);
    }, 1000);
  }, [elements, setStore, saveImage, screenIndex, screens.screens]);

  const handleRenameConfirm = () => {
    setScreens({
      screens: renameScreen(screens.screens, screenIndex, newName),
      selectedIndex: screenIndex,
    });
    setIsRenameModalVisible(false);
  };

  const handleRenameCancel = () => {
    setNewName(preName);
    setIsRenameModalVisible(false);
  };

  useEffect(() => {
    checkForChange();
  }, [elements, store.elements]);

  const handleBack = () => {
    OverlayModule.triggerTickHaptic();
    navigation.goBack();
  };

  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width: width,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: scale(10),
      }}>
      <View style={{width: scale(50)}}>
        <IconPill icon="chevron-back" onPress={handleBack} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(10),
          marginLeft: scale(20),
        }}>
        <Label
          text={headingText}
          style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}
        />
        <TouchableOpacity
          onPress={handleRenameModal}
          activeOpacity={0.8}
          style={{padding: scale(5)}}>
          <Icon name="pencil-outline" size={20} color="#888" />
        </TouchableOpacity>
      </View>
      <View style={{width: scale(50)}}>
        <IconPill
          onPress={handleSaveModal}
          hasWarning={hasUnsavedChanges}
          disabled={isSavingState}
          icon={isSavingState ? 'hourglass-outline' : 'checkmark'}
        />
      </View>
      <ModalWindow
        content={() => (
          <View style={{gap: scale(10), paddingHorizontal: scale(10)}}>
            <Label
              text="You have unsaved changes."
              hasWarning={hasUnsavedChanges}
            />
            <ActionButton
              text="Save AOD"
              type="Secondary"
              onPress={saveChanges}
            />
            <ActionButton text="Save & Apply AOD" onPress={saveChanges} />
          </View>
        )}
        headerContent={() => (
          <View style={{alignItems: 'flex-end'}}>
            <Icon
              name="close"
              size={20}
              color="white"
              onPress={handleSaveModal}
            />
          </View>
        )}
        heading="Save or Apply?"
        isVisible={isSaveModalVisible}
        onBackPressed={() => {}}
      />
      <ModalWindow
        heading="Rename"
        content={() => (
          <View style={{gap: scale(10), paddingHorizontal: scale(10)}}>
            <TextBox
              placeholder="Enter new name"
              multiline={false}
              value={newName}
              onChangeText={setNewName}
              maxLength={15}
              style={{fontSize: scale(10)}}
            />
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <ActionButton
                text="Cancel"
                onPress={handleRenameCancel}
                type="Secondary"
              />
              <ActionButton text="Rename" onPress={handleRenameConfirm} />
            </View>
          </View>
        )}
        isVisible={isRenameModalVisible}
        onBackPressed={() => {
          setIsRenameModalVisible(false);
        }}
      />
    </View>
  );
};

export default EditorHeader;
