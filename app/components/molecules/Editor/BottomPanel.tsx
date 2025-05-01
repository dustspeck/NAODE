import {View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import Icon from 'react-native-vector-icons/Ionicons';

const BottomPanel: React.FC<{}> = () => {
  const {width, height} = useWindowDimensions();
  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width: width,
      }}>
      <Icon name="add-circle" size={40} color="white" />
    </View>
  );
};

export default BottomPanel;
