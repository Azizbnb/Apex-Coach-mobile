module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV ?? 'development');
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // Désactive le plugin Babel reanimated en mode test (react-native-worklets absent)
          reanimated: !isTest,
        },
      ],
      'nativewind/babel',
    ],
  };
};
