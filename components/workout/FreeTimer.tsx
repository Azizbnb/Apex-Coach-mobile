import { View, Pressable, Modal } from 'react-native';
import { X } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';

const PRESETS = [
  { label: '30 s', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '1 min 30', seconds: 90 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
] as const;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface FreeTimerProps {
  visible: boolean;
  remaining: number;
  isRunning: boolean;
  onSelectPreset: (seconds: number) => void;
  onStop: () => void;
  onClose: () => void;
}

/**
 * Panneau modal compact du minuteur libre.
 * Affiche les presets de durée et, si un timer est actif, le countdown + bouton stop.
 */
export function FreeTimer({
  visible,
  remaining,
  isRunning,
  onSelectPreset,
  onStop,
  onClose,
}: FreeTimerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        onPress={onClose}
        accessibilityLabel="Fermer le minuteur"
      >
        {/* Empêche la propagation du tap vers le fond */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-apex-black-800 rounded-t-3xl px-6 pt-6 pb-10 border-t border-apex-black-700">
            {/* En-tête */}
            <View className="flex-row items-center justify-between mb-5">
              <Text variant="h3" className="text-white">Minuteur libre</Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color={colors.black[400]} />
              </Pressable>
            </View>

            {/* Countdown discret si le timer est en cours */}
            {isRunning && (
              <View className="items-center mb-5">
                <Text variant="h1" className="text-apex-lime-500 tabular-nums">
                  {formatTime(remaining)}
                </Text>
                <Text variant="caption" className="text-apex-black-400 mt-1">
                  en cours
                </Text>
              </View>
            )}

            {/* Boutons presets */}
            <View className="flex-row flex-wrap gap-3 mb-4">
              {PRESETS.map((p) => (
                <Pressable
                  key={p.seconds}
                  onPress={() => onSelectPreset(p.seconds)}
                  accessibilityRole="button"
                  accessibilityLabel={`Démarrer ${p.label}`}
                  className="bg-apex-black-700 rounded-xl px-5 py-3 active:opacity-60"
                >
                  <Text variant="label" className="text-white">{p.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Bouton stop, visible uniquement si timer actif */}
            {isRunning && (
              <Pressable
                onPress={onStop}
                accessibilityRole="button"
                accessibilityLabel="Arrêter le minuteur"
                className="border border-apex-error/50 rounded-xl px-4 py-3 items-center active:opacity-60"
              >
                <Text variant="label" className="text-apex-error">Arrêter</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
