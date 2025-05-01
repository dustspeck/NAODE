import {View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import IconPill from '../../atoms/IconPill';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';

const EditorHeader: React.FC = () => {
  const {width, height} = useWindowDimensions();
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
        <IconPill icon="checkmark" />
      </View>
    </View>
  );
};

export default EditorHeader;
