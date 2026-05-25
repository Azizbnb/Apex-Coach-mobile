import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { Lock, Apple } from 'lucide-react-native';
import { SafeView } from '@/components/ui/SafeView';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Skeleton } from '@/components/ui/Skeleton';
import { MacroSummary } from '@/components/nutrition/MacroSummary';
import { MealPlanCard } from '@/components/nutrition/MealPlanCard';
import { ShoppingList } from '@/components/nutrition/ShoppingList';
import { MealDetail } from '@/components/nutrition/MealDetail';
import { RecipeDetail } from '@/components/nutrition/RecipeDetail';
import { SupplementRecs } from '@/components/affiliate/SupplementRecs';
import { NutritionGenerationProgress } from '@/components/nutrition/NutritionGenerationProgress';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { useNutritionStore } from '@/stores/nutrition';
import { colors } from '@/lib/constants';
import type { Food, Meal } from '@/types';

const PAYWALL_URL =
  'https://www.apexcoach.app/pricing?utm_source=ios_app&utm_medium=paywall&utm_campaign=nutrition_gate';
const POLL_INTERVAL_MS = 5000;

function NutritionSkeleton() {
  return (
    <View className="px-4 gap-4">
      <Skeleton height={120} borderRadius={16} />
      <Skeleton height={140} borderRadius={16} />
      <Skeleton height={140} borderRadius={16} />
    </View>
  );
}

export default function NutritionScreen() {
  const { hasNutrition } = useSubscription();
  const { nutritionPlan, loading, fetchPlan, retryGeneration } = useNutritionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [shoppingVisible, setShoppingVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [retrying, setRetrying] = useState(false);
  const prevStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (hasNutrition) fetchPlan();
  }, [hasNutrition, fetchPlan]);

  // Polling toutes les 5s quand la génération est en cours
  useEffect(() => {
    if (nutritionPlan?.status !== 'generating') return;
    const id = setInterval(() => fetchPlan(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [nutritionPlan?.status, fetchPlan]);

  // Toast natif quand le plan passe de 'generating' à 'ready'
  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = nutritionPlan?.status;
    if (prev === 'generating' && curr === 'ready') {
      Alert.alert('Plan nutrition prêt !', 'Ton plan nutrition a été généré avec succès. 🎉');
    }
    prevStatusRef.current = curr;
  }, [nutritionPlan?.status]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlan();
    setRefreshing(false);
  }, [fetchPlan]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      await retryGeneration();
    } finally {
      setRetrying(false);
    }
  }, [retryGeneration]);

  if (!hasNutrition) {
    return (
      <SafeView>
        <FeatureGate
          icon={Lock}
          title="Coaching Pro requis"
          description="Ton plan nutrition IA personnalisé est disponible avec l'abonnement Coaching Pro. Continue ton abonnement sur apexcoach.app."
          ctaUrl={PAYWALL_URL}
          ctaLabel="Voir mes options sur apexcoach.app"
        />
      </SafeView>
    );
  }

  if (loading && !nutritionPlan) {
    return (
      <SafeView>
        <View className="pt-6">
          <NutritionSkeleton />
        </View>
      </SafeView>
    );
  }

  const planStatus = nutritionPlan?.status;
  if (planStatus === 'generating' || planStatus === 'failed') {
    return (
      <SafeView>
        <NutritionGenerationProgress
          status={planStatus}
          onRetry={handleRetry}
          retrying={retrying}
        />
      </SafeView>
    );
  }

  if (!nutritionPlan) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center px-6">
          <Apple size={48} color={colors.black[400]} />
          <Text className="text-xl font-bold text-white mt-4 mb-2 text-center">
            Plan nutrition non disponible
          </Text>
          <Text className="text-apex-black-400 text-center">
            Ton plan nutrition sera généré une fois ton questionnaire complété.
          </Text>
        </View>
      </SafeView>
    );
  }

  const meals: Meal[] = nutritionPlan.meals ?? [];

  return (
    <SafeView>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.lime[500]}
          />
        }
        ListHeaderComponent={
          <View className="px-4 pt-4 pb-2">
            <Text className="text-white font-bold text-2xl mb-1">Nutrition</Text>
            <Text className="text-apex-black-400 text-sm mb-4">
              Plan du jour · {meals.length} repas
            </Text>
            <MacroSummary
              calories={nutritionPlan.calories}
              protein={nutritionPlan.protein}
              carbs={nutritionPlan.carbs}
              fats={nutritionPlan.fats}
              className="mb-4"
            />
            <Button
              variant="secondary"
              onPress={() => setShoppingVisible(true)}
              className="mb-4"
            >
              Liste de courses
            </Button>
          </View>
        }
        renderItem={({ item: meal }) => (
          <MealPlanCard
            meal={meal}
            onPress={() => setSelectedMeal(meal)}
            className="mx-4 mb-3"
          />
        )}
        ListFooterComponent={
          <View className="px-4 pt-4 pb-8">
            <View className="h-px bg-apex-black-700 mb-5" />
            <SupplementRecs sourcePage="nutrition_tab" />
          </View>
        }
      />
      <ShoppingList
        meals={meals}
        visible={shoppingVisible}
        onClose={() => setShoppingVisible(false)}
      />
      <MealDetail
        meal={selectedMeal}
        visible={!!selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onFoodPress={setSelectedFood}
      />
      <RecipeDetail
        food={selectedFood}
        visible={!!selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </SafeView>
  );
}
