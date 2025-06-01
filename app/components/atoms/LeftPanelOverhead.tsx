import {View} from 'react-native';
import {scale} from 'react-native-size-matters';

interface ILeftPanelOverheadProps {
  children: React.ReactNode;
}

const LeftPanelOverhead = ({children}: ILeftPanelOverheadProps) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: scale(40),
        top: scale(5),
        width: scale(120),
        zIndex: 1000,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
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

export default LeftPanelOverhead;
