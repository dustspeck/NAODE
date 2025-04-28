import React from 'react';
import {ScrollView, StatusBar, View} from 'react-native';

function App(): React.JSX.Element {
  const safePadding = '5%';

  return (
    <View style={{backgroundColor: '#000', flex: 1}}>
      <StatusBar barStyle={'light-content'} backgroundColor={'#000'} />
      <ScrollView style={{backgroundColor: '#000'}}>
        <View style={{paddingRight: safePadding}}></View>
      </ScrollView>
    </View>
  );
}

export default App;
