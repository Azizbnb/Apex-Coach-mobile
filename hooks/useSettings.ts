import { useSettingsStore } from '@/stores/settings';

export function useSettings() {
  const macroViewMode = useSettingsStore((s) => s.macroViewMode);
  const toggleMacroViewMode = useSettingsStore((s) => s.toggleMacroViewMode);
  const load = useSettingsStore((s) => s.load);
  return { macroViewMode, toggleMacroViewMode, load };
}
