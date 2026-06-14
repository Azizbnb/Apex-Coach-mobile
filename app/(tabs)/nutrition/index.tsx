import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { Lock, Apple } from 'lucide-react-native';
import { SafeView } from '@/components/ui/SafeView';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { MacroRings } from '@/components/nutrition/MacroRings';
import { NutritionGenerationProgress } from '@/components/nutrition/NutritionGenerationProgress';
import { MealPlanCard } from '@/components/nutrition/MealPlanCard';
import { ShoppingList } from '@/components/nutrition/ShoppingList';
import { MealDetail } from '@/components/nutrition/MealDetail';
import { RecipeDetail } from '@/components/nutrition/RecipeDetail';
import { useSubscription } from '@/hooks/useSubscription';
import { useNutritionStore } from '@/stores/nutrition';
import { colors } from '@/lib/constants';
import { buildWebUrl } from '@/lib/web-browser';
import { resolveNutritionState } from '@/lib/nutrition/generation-state';
import type { Food, Meal } from '@/types';

// Modèle Netflix / conformité Reader App : on pointe vers la home apexcoach.app
// (jamais une page prix ou checkout), UTM d'attribution injectés.
const PAYWALL_URL = buildWebUrl('/', { medium: 'paywall', campaign: 'nutrition_gate' });

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
  const {
    nutritionPlan,
    loading,
    fetchPlan,
    generation,
    retrying,
    fetchGeneration,
    retryNutrition,
  } = useNutritionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [shoppingVisible, setShoppingVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const viewState = resolveNutritionState(!!nutritionPlan, generation);

  useEffect(() => {
    if (hasNutrition) {
      fetchPlan();
      fetchGeneration();
    }
  }, [hasNutrition, fetchPlan, fetchGeneration]);

  // Polling léger tant que la génération est en cours (auto-rafraîchit à la fin).
  useEffect(() => {
    if (viewState !== 'generating') return;
    const id = setInterval(() => {
      fetchPlan();
      fetchGeneration();
    }, 15000);
    return () => clearInterval(id);
  }, [viewState, fetchPlan, fetchGeneration]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPlan(), fetchGeneration()]);
    setRefreshing(false);
  }, [fetchPlan, fetchGeneration]);

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

  if (loading && viewState === 'none') {
    return (
      <SafeView>
        <View className="pt-6">
          <NutritionSkeleton />
        </View>
      </SafeView>
    );
  }

  if (viewState === 'generating' || viewState === 'failed') {
    return (
      <SafeView>
        <NutritionGenerationProgress
          failed={viewState === 'failed'}
          retrying={retrying}
          onRetry={retryNutrition}
        />
      </SafeView>
    );
  }

  if (viewState === 'none') {
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

  // viewState === 'ready' garantit un plan ; garde défensif pour TypeScript.
  if (!nutritionPlan) return null;

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
            <MacroRings
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
        ListFooterComponent={<View className="h-6" />}
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
