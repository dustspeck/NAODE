import {View, useWindowDimensions} from 'react-native';
import {scale} from 'react-native-size-matters';

interface BottomPanelOverheadProps {
  children: React.ReactNode;
}

const BottomPanelOverhead = ({children}: BottomPanelOverheadProps) => {
  const {width} = useWindowDimensions();
  return (
    <View
      style={{
        position: 'absolute',
        top: scale(-50),
        width: width,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(8),
          backgroundColor: '#111a',
          padding: scale(6),
          paddingHorizontal: scale(16),
          borderRadius: scale(10),
        }}>
        {children}
      </View>
    </View>
  );
};

export default BottomPanelOverhead;
