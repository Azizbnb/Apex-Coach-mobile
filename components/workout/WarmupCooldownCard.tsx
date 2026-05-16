import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
} from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/lib/constants';

interface WarmupCooldownCardProps {
  type: 'warmup' | 'cooldown';
  durationMinutes: number;
  exercises: string[];
  /** URL vidéo de démo par exercice (même index) — optionnel */
  videoUrls?: Array<string | undefined>;
  onComplete: () => void;
}

const LABELS = {
  warmup: {
    title: 'Échauffement',
    cta: 'Échauffement terminé',
    accent: 'lime',
  },
  cooldown: {
    title: 'Retour au calme',
    cta: 'Retour au calme terminé',
    accent: 'lime',
  },
} as const;

/**
 * Carte expandable affichant la liste des exercices d'échauffement ou de retour
 * au calme, avec un bouton "Démo" optionnel par exercice et un CTA de fin.
 * Mirror du composant web `WarmupCooldownCard.tsx`.
 */
export function WarmupCooldownCard({
  type,
  durationMinutes,
  exercises,
  videoUrls,
  onComplete,
}: WarmupCooldownCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const config = LABELS[type];

  const handleDemoPress = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <View className="bg-apex-black-800 rounded-2xl border border-apex-black-700 overflow-hidden">
      {/* Header expandable */}
      <Pressable
        onPress={() => setIsOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={`${config.title}, ${durationMinutes} minutes, ${exercises.length} exercices`}
        accessibilityState={{ expanded: isOpen }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        className="flex-row items-center justify-between px-4 py-4 active:opacity-80"
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 rounded-full bg-apex-lime-500/15 items-center justify-center">
            <Activity size={18} color={colors.lime[500]} />
          </View>
          <View className="flex-1">
            <Text variant="h3" className="text-white">
              {config.title}
            </Text>
            <Text variant="caption" className="text-apex-black-400">
              {durationMinutes} min · {exercises.length} exercice
              {exercises.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        {isOpen ? (
          <ChevronUp size={20} color={colors.black[400]} />
        ) : (
          <ChevronDown size={20} color={colors.black[400]} />
        )}
      </Pressable>

      {/* Corps expandable */}
      {isOpen && (
        <View className="px-4 pb-4">
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
            <View className="gap-2">
              {exercises.map((label, idx) => {
                const videoUrl = videoUrls?.[idx];
                return (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between gap-3 bg-apex-black-900 rounded-xl px-3 py-3 border border-apex-black-700"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-7 h-7 rounded-full bg-apex-black-800 border border-apex-black-700 items-center justify-center">
                        <Text variant="caption" className="text-apex-lime-500 font-bold">
                          {idx + 1}
                        </Text>
                      </View>
                      <Text variant="body" className="text-white flex-1">
                        {label}
                      </Text>
                    </View>
                    {videoUrl && (
                      <Pressable
                        onPress={() => handleDemoPress(videoUrl)}
                        accessibilityRole="link"
                        accessibilityLabel={`Voir la démo : ${label}`}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="flex-row items-center gap-1.5 bg-apex-lime-500/15 rounded-full px-3 py-1.5 active:opacity-70"
                      >
                        <Play size={12} color={colors.lime[500]} fill={colors.lime[500]} />
                        <Text variant="caption" className="text-apex-lime-500 font-semibold">
                          Démo
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <Button
            variant="secondary"
            onPress={onComplete}
            accessibilityLabel={config.cta}
            className="mt-4"
          >
            {config.cta}
          </Button>
        </View>
      )}

      {!isOpen && (
        <View className="px-4 pb-4">
          <View className="flex-row items-center gap-2">
            <CheckCircle2 size={16} color={colors.lime[500]} />
            <Text variant="caption" className="text-apex-black-400">
              Tape pour rouvrir la liste
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
