import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Linking, RefreshControl } from 'react-native';
import { Lock, ExternalLink, Apple } from 'lucide-react-native';
import { SafeView } from '@/components/ui/SafeView';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { MacroSummary } from '@/components/nutrition/MacroSummary';
import { MealPlanCard } from '@/components/nutrition/MealPlanCard';
import { ShoppingList } from '@/components/nutrition/ShoppingList';
import { RecipeDetail } from '@/components/nutrition/RecipeDetail';
import { useSubscription } from '@/hooks/useSubscription';
import { useNutritionStore } from '@/stores/nutrition';
import { colors } from '@/lib/constants';
import type { Food, Meal } from '@/types';

const PAYWALL_URL =
  'https://www.apexcoach.app/pricing?utm_source=ios_app&utm_medium=paywall&utm_campaign=nutrition_gate';

function NutritionSkeleton() {
  return (
    <View className="px-4 gap-4">
      <Skeleton height={120} borderRadius={16} />
      <Skeleton height={140} borderRadius={16} />
      <Skeleton height={140} borderRadius={16} />
    </View>
  );
}

function FeatureGate() {
  const openPaywall = useCallback(() => Linking.openURL(PAYWALL_URL), []);

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Lock size={48} color={colors.black[400]} />
      <Text className="text-xl font-bold text-white mt-4 mb-2 text-center">
        Coaching Pro requis
      </Text>
      <Text className="text-apex-black-400 text-center mb-8">
        Ton plan nutrition IA personnalisé est disponible avec l'abonnement Coaching Pro.
        Continue ton abonnement sur apexcoach.app.
      </Text>
      <Button variant="primary" onPress={openPaywall}>
        Voir mes options sur apexcoach.app
      </Button>
      <Pressable onPress={openPaywall} className="flex-row items-center gap-1 mt-3">
        <ExternalLink size={12} color={colors.black[400]} />
        <Text className="text-apex-black-400 text-xs">apexcoach.app</Text>
      </Pressable>
    </View>
  );
}

export default function NutritionScreen() {
  const { hasNutrition } = useSubscription();
  const { nutritionPlan, loading, fetchPlan } = useNutritionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [shoppingVisible, setShoppingVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  useEffect(() => {
    if (hasNutrition) fetchPlan();
  }, [hasNutrition, fetchPlan]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlan();
    setRefreshing(false);
  }, [fetchPlan]);

  if (!hasNutrition) {
    return (
      <SafeView>
        <FeatureGate />
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
            onPress={() => meal.foods[0] && setSelectedFood(meal.foods[0])}
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
      <RecipeDetail
        food={selectedFood}
        visible={!!selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </SafeView>
  );
}
