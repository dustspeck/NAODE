import {StatusBar, View} from 'react-native';

const StatusBarView = ({color}: {color?: string}) => {
  return (
    <View
      style={{
        height: StatusBar.currentHeight,
        minHeight: '3%',
        backgroundColor: color,
      }}
    />
  );
};

export default StatusBarView;
