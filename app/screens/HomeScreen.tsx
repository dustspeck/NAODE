import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PermissionStatus from '../components/molecules/PermissionsStatus';
import ActionButton from '../components/atoms/ActionButton';
import Label from '../components/atoms/Label';
import {scale} from 'react-native-size-matters';
import StatusBarView from '../components/atoms/StatusBarView';
import Toggle from '../components/atoms/Toggle';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  return (
    <View
      style={{
        margin: scale(15),
        marginHorizontal: scale(5),
        minHeight: '100%',
        backgroundColor: '#000',
        paddingHorizontal: scale(16),
        paddingBottom: scale(5),
      }}>
      <StatusBarView color="black" />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          alignContent: 'center',
          alignSelf: 'center',
        }}>
        <View style={{flex: 1}}>
          <Label text="NAODE" style={{fontSize: 24, fontWeight: 'bold'}} />
        </View>
        <View style={{width: scale(50)}}>
          <Toggle
            isEnabled={true}
            isLoading={false}
            onTogglePressed={() => {}}
          />
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          right: scale(10),
          left: scale(10),
          bottom: scale(30),
          padding: scale(10),
          borderRadius: scale(10),
        }}>
        <View
          style={{
            padding: scale(10),
            borderRadius: scale(10),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: 'center',
          }}>
          <ActionButton
            onPress={() => navigation.navigate('Editor')}
            text="Open Editor"
          />
        </View>
      </View>
      <PermissionStatus />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
