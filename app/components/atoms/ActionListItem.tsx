import {TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Label from './Label';
import { scale } from 'react-native-size-matters';

interface IActionListItemProps {
  heading: string;
  subheading: string;
  enabled: boolean;
  action: () => void;
  isWaited?: boolean;
}

const ActionListItem: React.FC<IActionListItemProps> = props => {
  const {action, enabled, heading, subheading, isWaited} = props;
  const isDisabled = enabled || isWaited;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      onPress={action}>
      <View
        style={{
          marginVertical: scale(5),
          padding: scale(10),
          backgroundColor: isDisabled ? '#1a1a1a' : '#2a2a2a',
          borderRadius: scale(10),
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flex: 1, paddingRight: scale(30)}}>
            <Label style={{fontWeight: '500'}} text={heading} />
            <Label style={{color: '#aaa'}} text={subheading} />
          </View>
          <View>
            <Icon
              name={
                isWaited
                  ? 'hourglass-outline'
                  : enabled
                  ? 'checkmark-outline'
                  : 'arrow-forward-outline'
              }
              style={{fontSize: scale(16), color: '#eee'}}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ActionListItem;
