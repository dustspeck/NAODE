import {StyleSheet, View} from 'react-native';
import ColorPicker, {
  Swatches,
  HueCircular,
  Panel1,
  InputWidget,
} from 'reanimated-color-picker';
import {runOnJS} from 'react-native-reanimated';
import {scale} from 'react-native-size-matters';

interface ColorWheelProps {
  value: string;
  onChange: (hex: string) => void;
}

const ColorWheel = ({value, onChange}: ColorWheelProps) => {
  const customSwatches = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FF00FF',
    '#00FFFF',
  ];
  return (
    <View>
      <ColorPicker
        value={value}
        sliderThickness={25}
        thumbSize={24}
        thumbShape="circle"
        onComplete={({hex}) => {
          'worklet';
          runOnJS(onChange)(hex);
        }}
        boundedThumb>
        <View style={styles.previewTxtContainer}>
          <InputWidget
            inputStyle={{
              color: '#fff',
              borderColor: '#707070',
              fontSize: 12,
            }}
            iconColor="#707070"
          />
        </View>
        <HueCircular containerStyle={styles.hueContainer} thumbShape="pill">
          <Panel1 style={styles.panelStyle} />
        </HueCircular>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Swatches
            style={styles.swatchesContainer}
            swatchStyle={styles.swatchStyle}
            colors={customSwatches}
          />
        </View>
      </ColorPicker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'orange',
  },
  hueContainer: {
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  panelStyle: {
    width: '70%',
    height: '70%',
    alignSelf: 'center',
    borderRadius: scale(16),
  },
  previewTxtContainer: {
    paddingBottom: scale(10),
    marginBottom: scale(10),
    borderBottomWidth: scale(1),
    borderColor: '#bebdbe',
  },
  swatchesContainer: {
    paddingVertical: scale(10),
    marginTop: scale(20),
    borderTopWidth: scale(1),
    borderColor: '#bebdbe',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: scale(10),
  },
  swatchStyle: {
    borderRadius: scale(15),
    height: scale(25),
    width: scale(25),
    marginHorizontal: scale(0),
    marginVertical: scale(10),
    borderWidth: scale(1),
    borderColor: '#fff',
  },
});

export default ColorWheel;
