module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo[^/]*|@expo|@react-navigation|@supabase|nativewind|react-native-css-interop|react-native-reanimated|react-native-worklets|react-native-gesture-handler|react-native-svg|lucide-react-native|zustand|react-native-url-polyfill)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
};
