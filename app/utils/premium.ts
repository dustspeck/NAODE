import RevenueCatUI, {PAYWALL_RESULT} from 'react-native-purchases-ui';

export async function launchPaywall() {
  const paywallResult: PAYWALL_RESULT =
    await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'pro',
    });
  console.log('paywallResult', paywallResult);
  return paywallResult;
}

export async function handlePremiumFeatureTap(
  isPremium: boolean,
  isPro: boolean,
  onPress: () => void,
) {
  if (isPro || !isPremium) {
    onPress();
  } else {
    const paywallResult = await launchPaywall();
    if (paywallResult === PAYWALL_RESULT.PURCHASED) {
      onPress();
    }
  }
}
