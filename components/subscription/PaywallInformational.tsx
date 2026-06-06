import { View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { openWebUrl } from '@/lib/web-browser';
import { colors } from '@/lib/constants';

/**
 * Paywall informational (modèle Netflix).
 *
 * AUCUN prix, AUCUN bouton "S'abonner X €", AUCUNE mention Apple/Google.
 * Le seul CTA pointe vers la HOME apexcoach.app (jamais /pricing) via openWebUrl
 * (décision 1B, conformité Reader App).
 */

export type PaywallTrigger = 'trial_expired' | 'trial_j1' | 'feature_locked' | 'trial_passive';

interface PaywallContent {
  title: string;
  body: string;
}

const CONTENT: Record<PaywallTrigger, PaywallContent> = {
  trial_expired: {
    title: 'Ton essai est terminé',
    body: 'Reprends ton coaching IA, ton suivi de progression et ta nutrition là où tu t’es arrêté. Tout continue sur le web.',
  },
  trial_j1: {
    title: 'Ton essai se termine bientôt',
    body: 'Plus qu’un jour pour profiter de ton essai. Continue ton aventure Apex Coach sans interruption.',
  },
  feature_locked: {
    title: 'Débloque toute l’expérience',
    body: 'Cette fonctionnalité fait partie de l’expérience complète Apex Coach. Découvre tout ce qui t’attend sur le web.',
  },
  trial_passive: {
    title: 'Continue avec Apex Coach',
    body: 'Programme IA, suivi de progression et plan nutrition personnalisé : toute l’expérience t’attend sur le web.',
  },
};

interface PaywallInformationalProps {
  trigger: PaywallTrigger;
  onClose: () => void;
}

export function PaywallInformational({ trigger, onClose }: PaywallInformationalProps) {
  const { title, body } = CONTENT[trigger];

  return (
    <View className="flex-1 bg-apex-black-900 px-6 justify-center">
      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-2xl bg-apex-lime-500/10 items-center justify-center mb-5">
          <Sparkles size={32} color={colors.lime[500]} />
        </View>
        <Text variant="h1" className="text-center mb-3">
          {title}
        </Text>
        <Text variant="body" className="text-center">
          {body}
        </Text>
      </View>

      <Button
        variant="primary"
        onPress={() => openWebUrl('/', { medium: 'paywall', campaign: `paywall_${trigger}` })}
      >
        Continuer sur le web
      </Button>
      <Button variant="ghost" onPress={onClose} className="mt-3">
        Plus tard
      </Button>
    </View>
  );
}
