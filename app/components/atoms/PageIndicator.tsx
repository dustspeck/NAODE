import {StyleSheet, View} from 'react-native';
import {scale} from 'react-native-size-matters';

interface IPageIndicatorProps {
  selectedIndex: number;
  dataLength: number;
}

const getPageIndicatorColor = (
  index: number,
  selectedIndex: number,
  dataLength: number,
) => {
  const isSelected = (i: number) => i === selectedIndex;
  const activeColor = '#eee8';
  const inactiveColor = '#eee4';
  if (dataLength === 1) return activeColor;
  if (dataLength === 2) {
    return isSelected(index) ? activeColor : inactiveColor;
  }
  if (index === 0) return isSelected(0) ? activeColor : inactiveColor;
  if (index === 2)
    return isSelected(dataLength - 1) ? activeColor : inactiveColor;
  return selectedIndex > 0 && selectedIndex < dataLength - 1
    ? activeColor
    : inactiveColor;
};

const Indicator = ({
  selectedIndex,
  dataLength,
}: {
  selectedIndex: number;
  dataLength: number;
}) => {
  const length = dataLength > 3 ? 3 : dataLength;
  return (
    <View style={styles.pageIndicator}>
      <View style={{flexDirection: 'row', gap: scale(6)}}>
        {Array.from({length}).map((_, index) => (
          <View
            key={index}
            style={{
              width: scale(4),
              height: scale(4),
              backgroundColor: getPageIndicatorColor(
                index,
                selectedIndex,
                dataLength,
              ),
              borderRadius: scale(5),
            }}
          />
        ))}
      </View>
    </View>
  );
};

const PageIndicator: React.FC<IPageIndicatorProps> = ({
  selectedIndex,
  dataLength,
}) => {
  return <Indicator selectedIndex={selectedIndex} dataLength={dataLength} />;
};

const styles = StyleSheet.create({
  pageIndicator: {
    position: 'absolute',
    bottom: scale(85),
    left: scale(10),
    right: scale(10),
    alignItems: 'center',
    padding: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: scale(12),
  },
});

export default PageIndicator;
