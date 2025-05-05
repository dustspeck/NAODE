import {
  Animated,
  Alert,
  ToastAndroid,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {EDIT_CONTROLS_RATIO} from '../../../constants/ui';
import ControlIcon from '../../atoms/ControlIcon';
import {scale} from 'react-native-size-matters';
import {useEffect, useState} from 'react';
import LeftPanelOverhead from '../../atoms/LeftPanelOverhead';
import Label from '../../atoms/Label';
import {useEditorContext} from '../../../context/EditorContext';
interface LeftPanelProps {
  animatedSize: Animated.Value;
  isZoomed: boolean;
  setIsZoomed: (isZoomed: boolean) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  animatedSize,
  isZoomed,
  setIsZoomed,
}) => {
  const {width, height} = useWindowDimensions();
  const [isLayersSelected, setIsLayersSelected] = useState(false);
  const {images, selectedImageId, setSelectedImageId, handleDeleteImage} =
    useEditorContext();

  useEffect(() => {
    if (selectedImageId === null) {
      setIsLayersSelected(false);
    }
  }, [selectedImageId]);

  const handleLayersPress = () => {
    if (isLayersSelected) {
      setIsLayersSelected(false);
    } else if (images.length === 0) {
      ToastAndroid.show('No items added', ToastAndroid.SHORT);
    } else {
      setIsLayersSelected(!isLayersSelected);
    }
  };

  const handleDeletePress = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this element?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDeleteImage(id),
      },
    ]);
  };

  return (
    <View>
      {isLayersSelected && (
        <LeftPanelOverhead>
          <View style={{alignItems: 'center', gap: scale(8)}}>
            {images.length === 0 && (
              <Label text="No items added" style={{color: '#555'}} />
            )}
            {images.map(image => (
              <TouchableOpacity
                key={image.id}
                activeOpacity={0.8}
                onPress={() => setSelectedImageId(image.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: scale(8),
                }}>
                <View
                  style={{
                    width: scale(5),
                    height: scale(5),
                    borderRadius: scale(3),
                    backgroundColor:
                      selectedImageId === image.id ? '#eee' : '#0000',
                    borderWidth: 1,
                    borderColor: '#555',
                  }}
                />
                <View style={{flex: 1}}>
                  <Label
                    text={image.name}
                    style={{
                      fontSize: scale(8),
                    }}
                  />
                </View>
                <ControlIcon
                  name="close"
                  style={{backgroundColor: '#555', padding: scale(2)}}
                  iconRatio={0.3}
                  onPress={() => {
                    handleDeletePress(image.id);
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </LeftPanelOverhead>
      )}
      <Animated.View
        style={{
          width: width * EDIT_CONTROLS_RATIO,
          height: animatedSize.interpolate({
            inputRange: [0, 1],
            outputRange: [0, height],
          }),
          alignItems: 'center',
          gap: scale(10),
        }}>
        <ControlIcon
          name="expand"
          onPress={() => setIsZoomed(!isZoomed)}
          label="Full screen"
        />
        <ControlIcon
          name="layers-outline"
          onPress={handleLayersPress}
          isSelected={isLayersSelected}
          label="Layers"
        />
      </Animated.View>
    </View>
  );
};

export default LeftPanel;
