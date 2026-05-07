import * as SecureStore from 'expo-secure-store';

/**
 * SecureStore wrapper that chunks large values across multiple keys.
 * SecureStore has a 2048 byte limit per item on iOS — workout sessions
 * and Supabase JWTs both exceed this. Direct SecureStore.setItemAsync
 * fails silently above the limit on iOS, causing silent data loss.
 */
const CHUNK_SIZE = 2000;

export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) return value;

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
    await this._removeAll(key);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

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
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}

    let index = 0;
    let exists = await SecureStore.getItemAsync(`${key}_chunk_${index}`);
    while (exists !== null) {
      await SecureStore.deleteItemAsync(`${key}_chunk_${index}`);
      index++;
      exists = await SecureStore.getItemAsync(`${key}_chunk_${index}`);
    }

    try {
      await SecureStore.deleteItemAsync(`${key}_chunks`);
    } catch {}
  },
};
