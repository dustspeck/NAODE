const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const config = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'lottie', 'json'],
  },
};

module.exports = wrapWithReanimatedMetroConfig(
  mergeConfig(defaultConfig, config),
);
