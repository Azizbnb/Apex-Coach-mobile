import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * SecureStore adapter for Supabase auth.
 * Handles large tokens by chunking across multiple keys
 * (SecureStore has a 2048 byte limit per item on some platforms).
 */
const CHUNK_SIZE = 2000;

const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    // Try direct read first (most common case)
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) return value;

    // Check for chunked data by iterating until null (not relying on count)
    const chunks: string[] = [];
    let index = 0;
    let chunk = await SecureStore.getItemAsync(`${key}_chunk_${index}`);
    while (chunk !== null) {
      chunks.push(chunk);
      index++;
      chunk = await SecureStore.getItemAsync(`${key}_chunk_${index}`);
    }

    return chunks.length > 0 ? chunks.join('') : null;
  },

  async setItem(key: string, value: string): Promise<void> {
    // Clean up old data first (both direct key and any chunks)
    await this._removeAll(key);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    // Store in chunks — write count FIRST for atomicity
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) || [];
    await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(`${key}_chunk_${index}`, chunk)
      )
    );
  },

  async removeItem(key: string): Promise<void> {
    await this._removeAll(key);
  },

  async _removeAll(key: string): Promise<void> {
    // Remove the direct key
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}

    // Remove chunks by iterating until null (resilient to stale count)
    let index = 0;
    let exists = await SecureStore.getItemAsync(`${key}_chunk_${index}`);
    while (exists !== null) {
      await SecureStore.deleteItemAsync(`${key}_chunk_${index}`);
      index++;
      exists = await SecureStore.getItemAsync(`${key}_chunk_${index}`);
    }

    // Remove the count key
    try {
      await SecureStore.deleteItemAsync(`${key}_chunks`);
    } catch {}
  },
};

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
