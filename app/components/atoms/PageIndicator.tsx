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
  switch (index) {
    case 0:
      return selectedIndex === 0 ? '#aaa' : '#555';
    case 2:
      return selectedIndex === dataLength - 1 ? '#aaa' : '#555';
    default:
      return selectedIndex > 0 && selectedIndex < dataLength - 1
        ? '#aaa'
        : '#555';
  }
};

const Indicator = ({
  selectedIndex,
  dataLength,
}: {
  selectedIndex: number;
  dataLength: number;
}) => {
  return (
    <View style={styles.pageIndicator}>
      <View style={{flexDirection: 'row', gap: scale(6)}}>
        {Array.from({length: 3}).map((_, index) => (
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
    bottom: scale(120),
    left: scale(10),
    right: scale(10),
    alignItems: 'center',
    padding: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: scale(12),
  },
});

export default PageIndicator;
