import React, {useContext, useEffect, useState} from 'react';
import {View, AppState, NativeModules, BackHandler} from 'react-native';

import ModalWindow from '../molecules/ModalWindow';
import ActionListItem from '../../components/atoms/ActionListItem';
import Icon from 'react-native-vector-icons/Ionicons';
import Label from '../atoms/Label';
import {scale} from 'react-native-size-matters';

function PermissionStatus(): React.JSX.Element | null {
  const {OverlayModule} = NativeModules;
  const [appState, setAppState] = useState(AppState.currentState);

  const [permissionsUpdated, setPermissionsUpdated] = useState(false);
  const [accessibilityPermission, setAccessibilityPermission] = useState(false);

  useEffect(() => {
    updatePermissionStates();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        updatePermissionStates();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const updatePermissionStates = async () => {
    const accessibilityGranted =
      await OverlayModule.checkAccessibilityPermission();
    setAccessibilityPermission(accessibilityGranted);

    setPermissionsUpdated(true);
  };

  const requestAccessibilityPermission = () => {
    OverlayModule.requestAccessibilityPermission();
  };

  const AccessibilityPermissionDashboard: React.FC = () => {
    return (
      <View>
        <Label
          text="NAODE requires the AccessibilityService API to work as intended. No personal data is collected or shared."
          style={{marginHorizontal: scale(5), marginBottom: scale(15)}}
        />
        <Label
          text="No need to enable the Shortcut option in the Accessibility settings."
          style={{
            marginHorizontal: scale(5),
            marginBottom: scale(15),
            fontSize: 10,
            opacity: 0.75,
          }}
        />
        <ActionListItem
          heading="Accept"
          subheading="Grant permission to continue using the app"
          enabled={false}
          action={requestAccessibilityPermission}
        />
        <ActionListItem
          heading="Deny"
          subheading="Deny permission and exit the app"
          enabled={false}
          action={() => {
            BackHandler.exitApp();
          }}
        />
      </View>
    );
  };

  interface IAllPermissionsStatusProps {
    isLoading?: boolean;
  }
  const AllPermissionsStatus: React.FC<IAllPermissionsStatusProps> = props => {
    const {isLoading} = props;
    return (
      <View style={{marginHorizontal: scale(15), marginVertical: scale(5)}}>
        <View style={{flexDirection: 'row', alignContent: 'center'}}>
          <Icon
            name={isLoading ? 'time-outline' : 'checkmark-done'}
            style={{
              fontSize: scale(16),
              paddingRight: scale(8),
              color: isLoading ? '#39ace7' : '#009900',
            }}
          />
          <Label
            text={
              isLoading
                ? 'Please provide required permissions'
                : 'All required permissions granted'
            }
            style={{color: '#999'}}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      {permissionsUpdated && accessibilityPermission ? (
        <AllPermissionsStatus />
      ) : (
        <>
          <AllPermissionsStatus isLoading />
          <ModalWindow
            onBackPressed={() => {}}
            isVisible={!accessibilityPermission}
            heading="Accessibility Permission"
            subHeading="Enable AccessibilityService API"
            content={AccessibilityPermissionDashboard}
          />
        </>
      )}
    </>
  );
}

export default PermissionStatus;
