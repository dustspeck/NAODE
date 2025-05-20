import {View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import IconPill from '../../atoms/IconPill';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';
import {useEditorContext} from '../../../context/EditorContext';
import {useEditorStore} from '../../../services/mmkv';
import {debounce, isEqual} from '../../../utils/common';
import {useCallback, useEffect, useMemo, useState} from 'react';
import ModalWindow from '../ModalWindow';
import ActionButton from '../../atoms/ActionButton';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

interface IHeaderProps {
  saveImage: () => void;
}

const EditorHeader: React.FC<IHeaderProps> = ({saveImage}) => {
  const {width, height} = useWindowDimensions();
  const navigation = useNavigation();
  const {elements, setSelectedElementId} = useEditorContext();
  const {store, setStore} = useEditorStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingState, setIsSavingState] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);

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
    setIsSaveModalVisible(!isSaveModalVisible);
  };

  const saveChanges = useCallback(() => {
    setSelectedElementId(null);
    setIsSavingState(true);
    setStore({elements});
    saveImage();
    setIsSaveModalVisible(false);
    setTimeout(() => {
      setIsSavingState(false);
    }, 1000);
  }, [elements, setStore, saveImage]);

  useEffect(() => {
    checkForChange();
  }, [elements, store.elements]);

  const handleBack = () => {
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
      <Label
        text="NAODE"
        style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}
      />
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
    </View>
  );
};

export default EditorHeader;
