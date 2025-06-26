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
import React, {useCallback, useEffect, useState} from 'react';
import LeftPanelOverhead from '../../atoms/LeftPanelOverhead';
import Label from '../../atoms/Label';
import {useEditorContext} from '../../../context/EditorContext';
import {ElementData} from '../../../types';
import ModalWindow from '../ModalWindow';
import ActionButton from '../../atoms/ActionButton';
import {NativeModules} from 'react-native';

const {OverlayModule} = NativeModules;

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
  const [sortedElements, setSortedElements] = useState<ElementData[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    elements,
    selectedElementId,
    setSelectedElementId,
    handleDeleteElement,
  } = useEditorContext();

  useEffect(() => {
    if (selectedElementId === null) {
      setIsLayersSelected(false);
    }
  }, [selectedElementId]);

  useEffect(() => {
    // sort elements by zIndex
    const sortedElements = elements.sort((a, b) => b.zIndex - a.zIndex);
    setSortedElements(sortedElements);
  }, [elements]);

  const handleLayersPress = () => {
    if (isLayersSelected) {
      setIsLayersSelected(false);
    } else if (elements.length === 0) {
      ToastAndroid.show('No items added', ToastAndroid.SHORT);
    } else {
      setIsLayersSelected(!isLayersSelected);
    }
  };

  const onLockPress = () => {
    OverlayModule.lockScreen();
  };

  const DeleteModal = useCallback(
    ({id}: {id: string}) => {
      return (
        <ModalWindow
          isVisible={isDeleting && selectedElementId === id}
          heading="Delete Element"
          subHeading="This action cannot be undone."
          content={() => (
            <View style={{gap: 10}}>
              <Label text="Are you sure you want to delete this element?" />
              <View
                style={{
                  flexDirection: 'row-reverse',
                  gap: 10,
                  paddingTop: scale(10),
                }}>
                <ActionButton
                  text="Delete"
                  onPress={() => {
                    handleDeleteElement(id);
                    setIsDeleting(false);
                  }}
                />
                <ActionButton
                  text="Cancel"
                  type="Secondary"
                  onPress={() => setIsDeleting(false)}
                />
              </View>
            </View>
          )}
          onBackPressed={() => setIsDeleting(false)}
        />
      );
    },
    [handleDeleteElement, isDeleting],
  );

  return (
    <View style={{backgroundColor: '#0c0c0c'}}>
      {isLayersSelected && (
        <LeftPanelOverhead>
          <View style={{alignItems: 'center', gap: scale(8)}}>
            <Label text="Layers" style={{color: '#eee', fontSize: scale(5)}} />
            {elements.length === 0 && (
              <Label text="No items added" style={{color: '#555'}} />
            )}
            {sortedElements.map(element => (
              <View
                key={element.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedElementId(element.id)}
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
                        selectedElementId === element.id ? '#eee' : '#0000',
                      borderWidth: 1,
                      borderColor: '#555',
                    }}
                  />
                  <View style={{flex: 1}}>
                    <Label
                      text={element.name}
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
                      setSelectedElementId(element.id);
                      setIsDeleting(true);
                    }}
                  />
                </TouchableOpacity>
                <DeleteModal id={element.id} />
              </View>
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
          gap: scale(15),
        }}>
        <ControlIcon
          name="expand"
          onPress={() => setIsZoomed(!isZoomed)}
          label="Full screen"
        />
        <ControlIcon
          name="lock-closed-outline"
          onPress={onLockPress}
          label="Lock screen"
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
