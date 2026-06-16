/**
 * APEX COACH MOBILE — ErrorBoundary global
 *
 * Wrappe l'arbre de composants. Capture les erreurs de rendu et les
 * remonte à Sentry (no-op si Sentry désactivé), puis affiche un écran
 * de repli en français dark theme avec un bouton « Réessayer ».
 */

import type { ReactNode } from 'react';
import { View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

function ErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <SafeView>
      <View className="flex-1 items-center justify-center px-8">
        <Text variant="h2" className="text-center">
          Oups, une erreur est survenue
        </Text>
        <Text variant="body" className="mt-3 text-center">
          L&apos;application a rencontré un problème inattendu. Tu peux réessayer.
          Si le souci persiste, redémarre l&apos;application.
        </Text>
        <Button className="mt-8 w-full" onPress={resetError}>
          Réessayer
        </Button>
      </View>
    </SafeView>
  );
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
