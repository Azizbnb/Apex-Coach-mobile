module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo[^/]*|@expo|@react-navigation|@supabase|nativewind|react-native-reanimated|react-native-gesture-handler|react-native-svg|lucide-react-native|react-native-css-interop|zustand)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
};
