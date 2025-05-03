import React from 'react';
import {Animated, View, useWindowDimensions} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import ControlIcon from '../../atoms/ControlIcon';
import {useEditorContext} from '../../../context/EditorContext';

interface BottomPanelProps {
  panValues: {[key: string]: Animated.ValueXY};
}

const BottomPanel: React.FC<BottomPanelProps> = ({panValues}) => {
  const {selectedImageId, handleUpdateImage, images, bringToFront, sendToBack} =
    useEditorContext();
  const {width, height} = useWindowDimensions();

  const handleCenterAlignHorizontal = () => {
    if (selectedImageId) {
      const image = images.find(image => image.id === selectedImageId);
      if (image) {
        const currentX = image.position.x;
        const centerY = (height - image.size.height) / 2;
        handleUpdateImage(selectedImageId, {
          position: {x: currentX, y: centerY},
        });
        panValues[selectedImageId].setValue({
          x: currentX,
          y: centerY,
        });
      }
    }
  };

  const handleCenterAlignVertical = () => {
    if (selectedImageId) {
      const image = images.find(image => image.id === selectedImageId);
      if (image) {
        const currentY = image.position.y;
        const centerX = (width - image.size.width) / 2;
        handleUpdateImage(selectedImageId, {
          position: {x: centerX, y: currentY},
        });
        panValues[selectedImageId].setValue({
          x: centerX,
          y: currentY,
        });
      }
    }
  };

  return (
    <View
      style={{
        height: height * EDIT_CONTROLS_RATIO,
        width: width,
      }}>
      {selectedImageId && (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <ControlIcon
            name="barcode-sharp"
            onPress={handleCenterAlignHorizontal}
          />
          <ControlIcon
            name="barcode-sharp"
            style={{transform: [{rotate: '90deg'}]}}
            onPress={handleCenterAlignVertical}
          />
          <View style={{width: 1, height: '100%', backgroundColor: '#333'}} />
          <ControlIcon
            name="arrow-up"
            onPress={() => selectedImageId && bringToFront(selectedImageId)}
            label="Front"
          />
          <ControlIcon
            name="arrow-down"
            onPress={() => selectedImageId && sendToBack(selectedImageId)}
            label="Back"
          />
        </View>
      )}
    </View>
  );
};

export default BottomPanel;
