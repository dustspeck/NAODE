import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Label from '../../atoms/Label';
import {scale} from 'react-native-size-matters';
import {useEditorStore} from '../../../services/mmkv';
import {Slider} from '@miblanchard/react-native-slider';
import ActionButton from '../../atoms/ActionButton';
import ModalWindow from '../ModalWindow';

interface BrightnessSliderModalProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

const BrightnessSliderModal = ({
  isVisible,
  setIsVisible,
}: BrightnessSliderModalProps) => (
  <ModalWindow
    isVisible={isVisible}
    heading="Overall Brightness"
    content={() => (
      <BrightnessSliderModalContent
        isVisible={isVisible}
        setIsVisible={setIsVisible}
      />
    )}
    footerContent={
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <ActionButton
          text="Done"
          type="Secondary"
          onPress={() => {
            setIsVisible(false);
          }}
        />
      </View>
    }
    onBackPressed={() => setIsVisible(false)}
  />
);

const BrightnessSliderModalContent = ({
  isVisible,
  setIsVisible,
}: BrightnessSliderModalProps) => {
  const [store, setStore] = useEditorStore();
  const [brightnessValue, setBrightnessValue] = useState(store.brightness);

  return (
    <>
      <View style={styles.container}>
        <Label
          text="Set the overall brightness of the ambient display."
          size={16}
          style={{color: '#aaa'}}
        />
        <Label
          text="To protect your screen, keep AOD content brightness low. This helps prevent burn-in and saves battery."
          size={16}
          style={{color: '#aaa'}}
        />
        <View style={styles.sliderContainer}>
          <Slider
            value={brightnessValue}
            onValueChange={value => setBrightnessValue(value[0])}
            minimumValue={0.1}
            maximumValue={1}
            step={0.1}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#444"
            thumbTintColor="#fff"
            onSlidingComplete={() => {
              setStore({brightness: brightnessValue});
            }}
            containerStyle={styles.slider}
          />
          <Label
            text={`${(brightnessValue * 100).toFixed(0)}%`}
            size={16}
            style={styles.sliderValue}
          />
        </View>
      </View>
    </>
  );
};

export default BrightnessSliderModal;

const styles = StyleSheet.create({
  container: {
    gap: scale(10),
    marginBottom: scale(10),
  },
  sliderContainer: {
    gap: scale(10),
    padding: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  slider: {
    width: scale(180),
    alignSelf: 'center',
  },
  sliderValue: {
    color: '#fff',
    width: scale(50),
    textAlign: 'center',
  },
});
