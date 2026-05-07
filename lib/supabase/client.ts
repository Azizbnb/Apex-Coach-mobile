import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { LargeSecureStore } from '@/lib/secure-store';

/**
 * Web fallback for expo web dev only.
 * WARNING: Uses localStorage which is vulnerable to XSS.
 * This should never be used in production web builds.
 */
const WebStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    if (__DEV__) {
      return window.localStorage.getItem(key);
    }
    console.warn('WebStorage should not be used in production');
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    if (__DEV__) {
      window.localStorage.setItem(key, value);
      return;
    }
    console.warn('WebStorage should not be used in production');
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    if (__DEV__) {
      window.localStorage.removeItem(key);
      return;
    }
    console.warn('WebStorage should not be used in production');
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? WebStorage : LargeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
