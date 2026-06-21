import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';
import { PAIN_LOCATIONS, type PainLocation } from '@/lib/validations/bilan';

/**
 * Sélecteur multi-zones de douleurs / inconforts (mirror web `pain_locations`).
 *
 * Choix d'implémentation : multi-select de chips plutôt qu'une heatmap SVG
 * anatomique avec hit-testing par région — plus robuste, accessible et testable
 * (le ticket S4-T01 autorise explicitement ce fallback). Les valeurs émises sont
 * les codes `PainLocation` strictement alignés sur l'enum web.
 *
 * Contrôlé : `value` (zones sélectionnées) + `onChange`.
 */

const ZONE_LABELS: Record<PainLocation, string> = {
  neck: 'Nuque',
  shoulders: 'Épaules',
  upper_back: 'Haut du dos',
  lower_back: 'Lombaires',
  hips: 'Hanches',
  knees: 'Genoux',
  ankles: 'Chevilles',
  wrists: 'Poignets',
  elbows: 'Coudes',
  other: 'Autre',
};

interface PainZonesPickerProps {
  value: PainLocation[];
  onChange: (zones: PainLocation[]) => void;
}

export function PainZonesPicker({ value, onChange }: PainZonesPickerProps) {
  const toggle = (zone: PainLocation) => {
    if (value.includes(zone)) {
      onChange(value.filter((z) => z !== zone));
    } else {
      onChange([...value, zone]);
    }
  };

  return (
    <View className="flex-row flex-wrap" accessibilityRole="radiogroup">
      {PAIN_LOCATIONS.map((zone) => {
        const selected = value.includes(zone);
        return (
          <Pressable
            key={zone}
            onPress={() => toggle(zone)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={ZONE_LABELS[zone]}
            hitSlop={4}
            className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
              selected
                ? 'bg-apex-lime-500/15 border-apex-lime-500'
                : 'bg-apex-black-800 border-apex-black-600'
            }`}
          >
            <Text
              variant="caption"
              className={selected ? 'text-apex-lime-400' : 'text-apex-black-300'}
              style={{ color: selected ? colors.lime[400] : colors.black[300] }}
            >
              {ZONE_LABELS[zone]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
