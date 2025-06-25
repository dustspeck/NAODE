import {View, ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import {usePurchases} from '../context/PurchasesContext';
import {useNavigation} from '@react-navigation/native';
import User from '../components/atoms/User';
import ActionButton from '../components/atoms/ActionButton';
import RevenueCatUI, {PAYWALL_RESULT} from 'react-native-purchases-ui';

async function presentPaywallIfNeeded() {
  const paywallResult: PAYWALL_RESULT =
    await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'pro',
    });
  console.log('paywallResult', paywallResult);
  return paywallResult;
}

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const {user, isLoading} = usePurchases();

  const handleSkip = () => {
    navigation.navigate('Home' as never);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <User user={user} />
        <View style={{height: 10}} />
        <ActionButton
          text="Buy Pro"
          onPress={presentPaywallIfNeeded}
          disabled={isLoading}
        />
        <View style={{height: 10}} />
        <ActionButton text="Skip" onPress={handleSkip} disabled={isLoading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 100,
  },
});

export default WelcomeScreen;
