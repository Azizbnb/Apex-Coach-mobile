import { create } from 'zustand';
import { LargeSecureStore } from '@/lib/secure-store';
import { profileApi } from '@/lib/api';
import type { FastingLevel } from '@/lib/fasting/date-calculation';

/**
 * Store des réglages utilisateur (S4-T17).
 *
 * Deux natures de state :
 *  1. Préférences purement locales (notifications, langue, tutoriel) →
 *     persistées dans SecureStore uniquement (pas de table dédiée côté web).
 *  2. Mode jeûne → reflète le profil serveur (`user_profiles.is_fasting_mode`,
 *     `fasting_level`, `fasting_start_date`, `fasting_end_date`, `fasting_notes`).
 *     La synchro serveur passe par `FastingToggleForm` (PATCH /api/profile/fasting) ;
 *     ce store garde le miroir local et l'hydrate depuis le profil au boot.
 *
 * NB : le brief mentionnait `fastingWindow` / `fastingDaysPerWeek`, mais le
 * contrat serveur réel est date-range + niveau (`FastingModeSchema` du web).
 * On suit le serveur pour rester synchronisé (règle « zéro modif backend »).
 */

const SETTINGS_STORAGE_KEY = 'apex_settings_v1';

export interface NotificationPrefs {
  workoutReminder: boolean;
  bilanDue: boolean;
  trialExpiry: boolean;
  promoExpiry: boolean;
}

/** Sous-état jeûne, miroir local du profil serveur. */
export interface FastingConfig {
  level: FastingLevel | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
}

/** Forme persistée localement (sous-ensemble sérialisable de l'état). */
interface PersistedSettings {
  notificationPrefs: NotificationPrefs;
  language: 'fr';
  tutorialSeen: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  workoutReminder: true,
  bilanDue: true,
  trialExpiry: true,
  promoExpiry: true,
};

const DEFAULT_FASTING_CONFIG: FastingConfig = {
  level: null,
  startDate: null,
  endDate: null,
  notes: null,
};

export interface SettingsState {
  // Jeûne (miroir serveur)
  fastingEnabled: boolean;
  fasting: FastingConfig;

  // Préférences locales
  notificationPrefs: NotificationPrefs;
  language: 'fr';
  tutorialSeen: boolean;

  hydrated: boolean;

  // Actions jeûne
  toggleFasting: (enabled: boolean) => void;
  setFastingConfig: (config: Partial<FastingConfig>) => void;
  /** Applique l'état renvoyé par le serveur après un PATCH réussi. */
  applyFastingFromServer: (input: {
    is_fasting_mode?: boolean;
    fasting_level?: FastingLevel | null;
    fasting_start_date?: string | null;
    fasting_end_date?: string | null;
    fasting_notes?: string | null;
  }) => void;

  // Actions préférences locales
  toggleNotification: (key: keyof NotificationPrefs) => void;
  setTutorialSeen: (seen?: boolean) => void;

  // Cycle de vie
  hydrate: () => Promise<void>;
  reset: () => void;
}

/** Persiste le sous-ensemble local dans SecureStore (best-effort). */
async function persistLocal(state: PersistedSettings): Promise<void> {
  try {
    await LargeSecureStore.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort : un échec de persistance ne doit pas casser l'UI.
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  fastingEnabled: false,
  fasting: DEFAULT_FASTING_CONFIG,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  language: 'fr',
  tutorialSeen: false,
  hydrated: false,

  toggleFasting: (enabled) => {
    set({ fastingEnabled: enabled });
  },

  setFastingConfig: (config) => {
    set((s) => ({ fasting: { ...s.fasting, ...config } }));
  },

  applyFastingFromServer: (input) => {
    set({
      fastingEnabled: !!input.is_fasting_mode,
      fasting: {
        level: input.fasting_level ?? null,
        startDate: input.fasting_start_date ?? null,
        endDate: input.fasting_end_date ?? null,
        notes: input.fasting_notes ?? null,
      },
    });
  },

  toggleNotification: (key) => {
    set((s) => ({
      notificationPrefs: {
        ...s.notificationPrefs,
        [key]: !s.notificationPrefs[key],
      },
    }));
    const { notificationPrefs, language, tutorialSeen } = get();
    void persistLocal({ notificationPrefs, language, tutorialSeen });
  },

  setTutorialSeen: (seen = true) => {
    set({ tutorialSeen: seen });
    const { notificationPrefs, language, tutorialSeen } = get();
    void persistLocal({ notificationPrefs, language, tutorialSeen });
  },

  hydrate: async () => {
    // 1. Préférences locales depuis SecureStore
    try {
      const raw = await LargeSecureStore.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
        set((s) => ({
          notificationPrefs: {
            ...s.notificationPrefs,
            ...(parsed.notificationPrefs ?? {}),
          },
          tutorialSeen: parsed.tutorialSeen ?? s.tutorialSeen,
        }));
      }
    } catch {
      // Stockage illisible → on garde les valeurs par défaut.
    }

    // 2. Mode jeûne depuis le profil serveur (si dispo)
    try {
      const profile = await profileApi.get();
      if (profile) {
        get().applyFastingFromServer({
          is_fasting_mode: profile.is_fasting_mode,
          fasting_level: profile.fasting_level,
          fasting_start_date: profile.fasting_start_date,
          fasting_end_date: profile.fasting_end_date,
          fasting_notes: profile.fasting_notes,
        });
      }
    } catch {
      // Hors-ligne / non authentifié → on n'écrase pas l'état local.
    }

    set({ hydrated: true });
  },

  reset: () => {
    set({
      fastingEnabled: false,
      fasting: DEFAULT_FASTING_CONFIG,
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      language: 'fr',
      tutorialSeen: false,
      hydrated: false,
    });
    void LargeSecureStore.removeItem(SETTINGS_STORAGE_KEY).catch(() => {});
  },
}));
