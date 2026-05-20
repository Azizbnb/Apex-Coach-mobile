import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type MacroViewMode = 'rings' | 'bars';

const SETTINGS_KEY = 'apex_ui_settings';

interface SettingsState {
  macroViewMode: MacroViewMode;
  toggleMacroViewMode: () => void;
  load: () => Promise<void>;
}

async function persistSettings(patch: Partial<{ macroViewMode: MacroViewMode }>) {
  try {
    const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
    const current = stored ? (JSON.parse(stored) as Record<string, unknown>) : {};
    await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    // Non-critique — préférence UI, pas bloquant
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  macroViewMode: 'rings',

  toggleMacroViewMode: () => {
    const next: MacroViewMode = get().macroViewMode === 'rings' ? 'bars' : 'rings';
    set({ macroViewMode: next });
    persistSettings({ macroViewMode: next });
  },

  load: async () => {
    try {
      const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<{ macroViewMode: MacroViewMode }>;
      if (parsed.macroViewMode === 'rings' || parsed.macroViewMode === 'bars') {
        set({ macroViewMode: parsed.macroViewMode });
      }
    } catch {
      // Non-critique
    }
  },
}));
