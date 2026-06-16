import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/stores/auth';
import { useSubscriptionStore } from '@/stores/subscription';
import { BACKGROUND_COLOR } from '@/lib/constants';
import { initSentry, setSentryUser, withSentry } from '@/lib/monitoring/sentry';
import { AppErrorBoundary } from '@/components/monitoring/AppErrorBoundary';

// Initialise Sentry avant le render (no-op si EXPO_PUBLIC_SENTRY_DSN absent)
initSentry();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const cleanup = useAuthStore((s) => s.cleanup);
  const initialized = useAuthStore((s) => s.initialized);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  // Plan dérivé pour le tag Sentry : trial > type d'abonnement > null
  const userPlan = useSubscriptionStore((s) => {
    const sub = s.subscription;
    if (!sub) return null;
    if (sub.is_trial) return 'trial';
    return sub.subscription_type ?? null;
  });

  useEffect(() => {
    initialize().finally(() => {
      SplashScreen.hideAsync();
    });

    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  // Met à jour le contexte Sentry (id UUID seul + plan) quand l'auth change
  useEffect(() => {
    setSentryUser({ userId, plan: userPlan });
  }, [userId, userPlan]);

  if (!initialized) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: BACKGROUND_COLOR },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </AppErrorBoundary>
  );
}

export default withSentry(RootLayout);
