module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo[^/]*|@expo|@react-navigation|@supabase|nativewind|react-native-css-interop|react-native-reanimated|react-native-worklets|react-native-gesture-handler|react-native-svg|lucide-react-native|zustand|react-native-url-polyfill)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Stub du plugin Babel react-native-worklets (requis par reanimated v4, non installé en CI)
    '^react-native-worklets/plugin$': '<rootDir>/__mocks__/react-native-worklets-plugin.js',
    '^expo-video$': '<rootDir>/__mocks__/expo-video.js',
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
};
