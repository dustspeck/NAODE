import LottieView from 'lottie-react-native';
import {scale} from 'react-native-size-matters';

export const EmptySlate = () => {
  return (
    <LottieView
      source={require('../../../assets/animations/empty_slate_themed.lottie')}
      autoPlay
      loop
      style={{width: scale(150), height: scale(150)}}
    />
  );
};
