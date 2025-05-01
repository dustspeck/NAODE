import {View} from 'react-native';

const WarningIcon = ({size}: {size: number}) => (
  <View
    style={{
      backgroundColor: '#c95',
      height: size / 2,
      width: size / 2,
      borderRadius: 99,
      position: 'absolute',
      right: 0,
      top: 0,
    }}
  />
);

export default WarningIcon;
