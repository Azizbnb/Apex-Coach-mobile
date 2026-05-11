import { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ExternalLink } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/lib/constants';

interface FeatureGateProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  ctaUrl: string;
  ctaLabel: string;
}

export function FeatureGate({ icon: Icon, title, description, ctaUrl, ctaLabel }: FeatureGateProps) {
  const openUrl = useCallback(() => WebBrowser.openBrowserAsync(ctaUrl), [ctaUrl]);

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Icon size={48} color={colors.black[400]} />
      <Text className="text-xl font-bold text-white mt-4 mb-2 text-center">{title}</Text>
      <Text className="text-apex-black-400 text-center mb-8">{description}</Text>
      <Button variant="primary" onPress={openUrl}>{ctaLabel}</Button>
      <Pressable
        onPress={openUrl}
        accessibilityRole="link"
        accessibilityLabel="Ouvrir apexcoach.app dans le navigateur"
        className="flex-row items-center gap-1 mt-3"
      >
        <ExternalLink size={12} color={colors.black[400]} />
        <Text className="text-apex-black-400 text-xs">apexcoach.app</Text>
      </Pressable>
    </View>
  );
}
