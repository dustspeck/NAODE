import {View, useWindowDimensions} from 'react-native';
import {scale} from 'react-native-size-matters';

interface IRightPanelOverheadProps {
  children: React.ReactNode;
}

const RightPanelOverhead = ({children}: IRightPanelOverheadProps) => {
  const {width, height} = useWindowDimensions();
  return (
    <View
      style={{
        position: 'absolute',
        right: scale(40),
        top: scale(5),
        width: scale(120),
        zIndex: 1000,
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
      }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          gap: scale(8),
          backgroundColor: '#222a',
          padding: scale(6),
          paddingHorizontal: scale(16),
          borderRadius: scale(10),
        }}>
        {children}
      </View>
    </View>
  );
};

export default RightPanelOverhead;
