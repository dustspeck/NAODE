import React from 'react';
import {View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import ControlIcon from '../../atoms/ControlIcon';
import { useEditorContext } from '../../../context/EditorContext';

interface ImageData {
  id: string;
  uri: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const BottomPanel: React.FC = () => {
  const {
    images,
    selectedImageId,
    isSelected,
    setSelectedImageId,
    setIsSelected
  } = useEditorContext();
  const {width, height} = useWindowDimensions();
  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width: width,
      }}>
      {isSelected && (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <ControlIcon name="link" onPress={() => {}} />
          <ControlIcon name="scan" onPress={() => {}} />
        </View>
      )}
    </View>
  );
};

export default BottomPanel;
