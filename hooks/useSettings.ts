import { useSettingsStore } from '@/stores/settings';

/**
 * Convenience hook pour les réglages — sélecteurs stables (pattern identique
 * à useAuth / useSubscription).
 */
export function useSettings() {
  const fastingEnabled = useSettingsStore((s) => s.fastingEnabled);
  const fasting = useSettingsStore((s) => s.fasting);
  const notificationPrefs = useSettingsStore((s) => s.notificationPrefs);
  const language = useSettingsStore((s) => s.language);
  const tutorialSeen = useSettingsStore((s) => s.tutorialSeen);
  const hydrated = useSettingsStore((s) => s.hydrated);

  const toggleFasting = useSettingsStore((s) => s.toggleFasting);
  const setFastingConfig = useSettingsStore((s) => s.setFastingConfig);
  const applyFastingFromServer = useSettingsStore((s) => s.applyFastingFromServer);
  const toggleNotification = useSettingsStore((s) => s.toggleNotification);
  const setTutorialSeen = useSettingsStore((s) => s.setTutorialSeen);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const reset = useSettingsStore((s) => s.reset);

  return {
    fastingEnabled,
    fasting,
    notificationPrefs,
    language,
    tutorialSeen,
    hydrated,
    toggleFasting,
    setFastingConfig,
    applyFastingFromServer,
    toggleNotification,
    setTutorialSeen,
    hydrate,
    reset,
  };
}
