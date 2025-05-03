import React from 'react';
import {View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import ControlIcon from '../../atoms/ControlIcon';
import {useEditorContext} from '../../../context/EditorContext';

const BottomPanel: React.FC = () => {
  const {selectedImageId} = useEditorContext();
  const {width, height} = useWindowDimensions();
  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width: width,
      }}>
      {selectedImageId && (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <ControlIcon name="link" onPress={() => {}} />
          <ControlIcon name="scan" onPress={() => {}} />
        </View>
      )}
    </View>
  );
};

export default BottomPanel;
