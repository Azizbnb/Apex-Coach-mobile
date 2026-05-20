// Mocks globaux pour les tests Apex Coach Mobile

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: 'Link',
  Stack: { Screen: 'Screen' },
  Tabs: { Screen: 'Screen' },
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

// react-native-reanimated est mocké via __mocks__/react-native-reanimated.js
jest.mock('react-native-reanimated');

// react-native-svg est mocké via __mocks__/react-native-svg.js
jest.mock('react-native-svg');

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  const makeGesture = () => {
    const g: Record<string, unknown> = {};
    g['activateAfterLongPress'] = jest.fn(() => g);
    g['onStart'] = jest.fn(() => g);
    g['onUpdate'] = jest.fn(() => g);
    g['onEnd'] = jest.fn(() => g);
    g['withRef'] = jest.fn(() => g);
    return g;
  };
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: { Pan: makeGesture, Tap: makeGesture },
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
