import { View, Text } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { EQUIPMENT_CATALOG } from '@/lib/affiliate/equipment-catalog';
import { colors } from '@/lib/constants';
import { AffiliateLink } from './AffiliateLink';

const PARTNER_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  decathlon: 'Décathlon',
};

interface EquipmentRecsProps {
  sourcePage?: string;
  className?: string;
}

export function EquipmentRecs({ sourcePage = 'equipment', className = '' }: EquipmentRecsProps) {
  return (
    <View className={className}>
      <View className="flex-row items-center gap-2 mb-4">
        <Dumbbell size={20} color={colors.lime[500]} />
        <Text className="text-white font-bold text-lg">Équipement recommandé</Text>
      </View>

      {Object.entries(EQUIPMENT_CATALOG).map(([key, item]) => (
        <View
          key={key}
          className="mb-3 p-4 bg-apex-black-800 rounded-2xl border border-apex-black-700"
        >
          <Text className="text-white font-semibold mb-1">{item.name}</Text>
          <Text className="text-apex-black-400 text-sm mb-3">{item.description}</Text>
          <View className="flex-row flex-wrap gap-2">
            {(Object.entries(item.links) as [string, string][]).map(([partner, url]) => (
              <AffiliateLink
                key={partner}
                url={url}
                label={PARTNER_LABELS[partner] ?? partner}
                productName={item.name}
                partnerSlug={partner}
                sourcePage={sourcePage}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
