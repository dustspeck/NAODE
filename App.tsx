import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './app/screens/HomeScreen';
import EditorScreen from './app/screens/EditorScreen';
import { EditorProvider } from './app/context/EditorContext';
import ShopScreen from './app/screens/ShopScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
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
