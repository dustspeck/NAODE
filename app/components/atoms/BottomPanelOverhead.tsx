import {View, useWindowDimensions} from 'react-native';
import {scale} from 'react-native-size-matters';

interface IBottomPanelOverheadProps {
  children: React.ReactNode;
  top?: number;
  backgroundColor?: string;
}

const BottomPanelOverhead = ({
  children,
  top = -50,
  backgroundColor = '#111d',
}: IBottomPanelOverheadProps) => {
  const {width} = useWindowDimensions();
  return (
    <View
      style={{
        position: 'absolute',
        top: scale(top),
        width,
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
          backgroundColor,
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
