import {View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import IconPill from '../../atoms/IconPill';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';
import {useEditorContext} from '../../../context/EditorContext';
import {useEditorStore} from '../../../services/mmkv';

const EditorHeader: React.FC = () => {
  const {width, height} = useWindowDimensions();
  const {elements} = useEditorContext();
  const {setStore} = useEditorStore();

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
          onPress={() => {
            setStore({elements});
          }}
          icon="checkmark"
        />
      </View>
    </View>
  );
};

export default EditorHeader;
