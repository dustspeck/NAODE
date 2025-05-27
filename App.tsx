import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './app/screens/HomeScreen';
import EditorScreen from './app/screens/EditorScreen';
import { EditorProvider } from './app/context/EditorContext';
import ShopScreen from './app/screens/ShopScreen';
import { RootStackParamList } from './app/types/navigation';
import { StatusBar } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <EditorProvider>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: {backgroundColor: 'black'},
            animation: 'slide_from_bottom',
          }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Editor" component={EditorScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
        </Stack.Navigator>
      </EditorProvider>
    </NavigationContainer>
  );
}

export default App;
