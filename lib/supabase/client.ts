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

    // Check for chunked data
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
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      // Clean up any old chunks
      await this._removeChunks(key);
      return;
    }

    // Store in chunks
    // First remove the direct key if it exists
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}

    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) || [];
    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(`${key}_chunk_${index}`, chunk)
      )
    );
    // Store chunk count for cleanup
    await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
    await this._removeChunks(key);
  },

  async _removeChunks(key: string): Promise<void> {
    const countStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (!countStr) return;

    const count = parseInt(countStr, 10);
    await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.deleteItemAsync(`${key}_chunk_${i}`)
      )
    );
    await SecureStore.deleteItemAsync(`${key}_chunks`);
  },
};

// Web fallback (for expo web dev)
const WebStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
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
