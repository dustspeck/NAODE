import {View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import IconPill from '../../atoms/IconPill';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';
import {useEditorContext} from '../../../context/EditorContext';
import {useEditorStore} from '../../../services/mmkv';
import {debounce, isEqual} from '../../../utils/common';
import {useCallback, useEffect, useMemo, useState} from 'react';

const EditorHeader: React.FC = () => {
  const {width, height} = useWindowDimensions();
  const {elements} = useEditorContext();
  const {store, setStore} = useEditorStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingState, setIsSavingState] = useState(false);

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

  const saveChanges = useCallback(() => {
    setIsSavingState(true);
    setStore({elements});
    setTimeout(() => {
      setIsSavingState(false);
    }, 1000);
  }, [elements, setStore]);

  useEffect(() => {
    checkForChange();
  }, [elements, store.elements]);

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
        <IconPill icon="chevron-back" />
      </View>
      <Label
        text="NAODE"
        style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}
      />
      <View style={{width: scale(50)}}>
        <IconPill
          onPress={saveChanges}
          hasWarning={hasUnsavedChanges}
          disabled={isSavingState}
          icon={isSavingState ? 'hourglass-outline' : 'checkmark'}
        />
      </View>
    </View>
  );
};

export default EditorHeader;
