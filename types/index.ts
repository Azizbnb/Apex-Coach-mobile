export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  phone?: string
  date_of_birth?: string
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance'
  level: 'beginner' | 'intermediate' | 'advanced'
  weight: number
  height: number
  age: number
  gender: 'male' | 'female' | 'other'
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active'
  preferences?: string

  // Fasting mode fields (generic: Ramadan, Carême, intermittent, etc.)
  is_fasting_mode?: boolean
  fasting_start_date?: string | null
  fasting_end_date?: string | null
  fasting_notes?: string | null
  fasting_level?: 'strict' | 'moderate' | 'light' | null

  // Admin
  is_admin?: boolean

  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  title: string
  description?: string
  exercises: Exercise[]
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
  scheduled_for?: string
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  rest_seconds: number
  notes?: string
}

/**
 * Démo vidéo d'un exercice (MuscleWiki).
 * Mirror du web `lib/musclewiki/client.ts` → `ExerciseVideo`.
 * - `videoType: 'youtube'` → `videoUrl` est une URL absolue d'embed (iframe)
 * - `videoType: 'proxy'`   → `videoUrl` est un chemin RELATIF
 *   `/api/exercises/video-proxy?url=...` (à préfixer par l'API_URL côté mobile)
 */
export interface ExerciseVideoData {
  videoUrl: string
  videoType: 'youtube' | 'proxy'
  thumbnailUrl: string | null
  muscles: string[]
  nameEn: string
}

export interface NutritionPlan {
  id: string
  user_id: string
  calories: number
  protein: number
  carbs: number
  fats: number
  meals: Meal[]
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string
  name: string
  time: string
  foods: Food[]
}

export interface Food {
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

export interface Progress {
  id: string
  user_id: string
  date: string
  weight?: number
  body_fat?: number
  measurements?: Measurements
  notes?: string
  photos?: string[]
  created_at: string
}

export interface Measurements {
  chest?: number
  waist?: number
  hips?: number
  arms?: number
  thighs?: number
}

/**
 * Type de plan d'abonnement
 * - starter: Paiement unique 29€ - Programme 4 semaines personnalisé IA
 * - coaching: 14,90€/mois ou 99€/an - Dashboard + Réadaptation IA hebdomadaire
 * - coaching_pro: 24,90€/mois ou 199€/an - FULL ACCESS + Nutrition + Stats avancées
 */
export type PlanType = 'starter' | 'coaching' | 'coaching_pro'

/**
 * Intervalle de facturation
 * - one_time: Paiement unique (Starter)
 * - monthly: Facturation mensuelle
 * - yearly: Facturation annuelle (économies)
 */
export type BillingInterval = 'one_time' | 'monthly' | 'yearly'

/**
 * Statut de l'abonnement
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'expired' | 'trialing'

/**
 * Interface Subscription
 * Gère à la fois les paiements uniques (starter) et les abonnements récurrents (coaching, coaching_pro)
 *
 * Note: stripe_customer_id a été déplacé vers la table stripe_customers pour éviter la redondance.
 * Pour récupérer le stripe_customer_id, utilisez:
 * - La vue subscriptions_with_customer
 * - Un JOIN avec stripe_customers
 * - La fonction get_stripe_customer_id(user_id)
 */
export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string // Null pour paiement unique (starter)
  stripe_price_id: string
  subscription_type: PlanType // Nom de la colonne en BDD
  billing_interval?: BillingInterval // Intervalle de facturation
  status: SubscriptionStatus

  // Tarification
  amount_cents: number // Montant payé en centimes
  currency: string // 'EUR'

  // Dates (optionnelles pour paiement unique)
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  canceled_at?: string

  // Promo (codes partenariat, ex: Court Clash)
  promo_code_id?: string | null
  is_promo_subscription?: boolean
  promo_end_date?: string | null

  // Trial gratuit (7 jours)
  is_trial?: boolean
  trial_end_date?: string | null
  trial_converted_at?: string | null
  trial_emails_sent?: string[]

  // Métadonnées
  created_at: string
  updated_at: string
}

/**
 * Interface SubscriptionWithCustomer
 * Subscription enrichie avec stripe_customer_id (via JOIN ou vue)
 */
export interface SubscriptionWithCustomer extends Subscription {
  stripe_customer_id: string
}

/**
 * Interface StripeCustomer
 * Table de mapping entre users et Stripe customers
 */
export interface StripeCustomer {
  id: string
  user_id: string
  stripe_customer_id: string
  created_at: string
  updated_at: string
}

/**
 * Configuration d'un plan de pricing pour l'affichage
 */
export interface PricingPlan {
  id: PlanType
  name: string
  prices: {
    monthly?: number // Prix mensuel en euros (coaching, coaching_pro)
    yearly?: number // Prix annuel en euros (coaching, coaching_pro)
    oneTime?: number // Prix unique en euros (starter)
  }
  billingInterval: BillingInterval
  description: string
  features: string[]
  highlighted?: boolean
  badge?: 'popular' | 'best_value' | 'premium'
  ctaText?: string
}

/**
 * Métadonnées des sessions Stripe Checkout
 * Utilisées lors de la création d'une session de paiement
 */
export interface CheckoutSessionMetadata extends Record<string, string | undefined> {
  /** Type de plan souscrit */
  plan: PlanType
  /** Intervalle de facturation (monthly/yearly pour coaching/coaching_pro) */
  billingInterval?: BillingInterval
  /** ID de l'utilisateur (optionnel pour les utilisateurs anonymes) */
  userId?: string
  /** Email pour les utilisateurs anonymes */
  email?: string
  /** ID du questionnaire en attente */
  pendingQuestionnaireId?: string
}

/**
 * Métadonnées des souscriptions Stripe
 * Utilisées lors de la création d'un abonnement récurrent
 */
export interface SubscriptionMetadata extends Record<string, string | undefined> {
  /** ID de l'utilisateur (optionnel car peut être ajouté après création du compte) */
  userId?: string
  /** Type de plan souscrit */
  plan: PlanType
  /** Intervalle de facturation (monthly/yearly) */
  billingInterval?: BillingInterval
  /** Indique si l'abonnement a un changement de prix planifié (coaching_pro) */
  hasScheduledPriceChange?: string
  /** ID du prix après la période initiale (coaching_pro) */
  priceIdAfter?: string
}

/**
 * Type helper pour extraire les métadonnées d'une session Stripe
 * Permet de typer les métadonnées reçues dans les webhooks
 */
export type WebhookSessionMetadata = Partial<CheckoutSessionMetadata>

// ==========================================
// NUTRITION PREFERENCES
// ==========================================

/**
 * Régimes alimentaires supportés
 */
export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'halal'
  | 'kosher'
  | 'gluten_free'
  | 'dairy_free'
  | 'paleo'
  | 'keto'
  | 'none'

/**
 * Allergies alimentaires
 */
export type FoodAllergy =
  | 'gluten'
  | 'lactose'
  | 'nuts'
  | 'peanuts'
  | 'tree_nuts'
  | 'shellfish'
  | 'eggs'
  | 'soy'
  | 'fish'
  | 'sesame'
  | 'none'

/**
 * Intolérances alimentaires
 */
export type FoodIntolerance =
  | 'lactose'
  | 'gluten'
  | 'fructose'
  | 'histamine'
  | 'fodmap'
  | 'none'

/**
 * Types de cuisines préférées
 */
export type CuisineType =
  | 'mediterranean'
  | 'asian'
  | 'italian'
  | 'french'
  | 'mexican'
  | 'indian'
  | 'middle_eastern'
  | 'american'
  | 'japanese'
  | 'thai'

/**
 * Niveaux de budget
 */
export type BudgetLevel = 'low' | 'medium' | 'high' | 'unlimited'

/**
 * Temps de préparation disponible
 */
export type MealPrepTime = 'minimal' | 'moderate' | 'extensive'

/**
 * Complexité des recettes
 */
export type RecipeComplexity = 'simple' | 'intermediate' | 'complex'

/**
 * Interface NutritionPreferences
 * Préférences nutritionnelles pour la génération de meal prep (Coaching Pro uniquement)
 */
export interface NutritionPreferences {
  id: string
  user_id: string

  // Restrictions
  dietary_restrictions: DietaryRestriction[]
  allergies: FoodAllergy[]
  intolerances: FoodIntolerance[]
  disliked_foods?: string

  // Préférences
  cuisine_preferences: CuisineType[]
  weekly_budget?: BudgetLevel
  meal_prep_time?: MealPrepTime
  meals_per_day: number // 2-6
  recipe_complexity: RecipeComplexity

  // Suppléments et objectifs
  supplements?: string
  nutrition_goals?: string
  preferred_beverages: string[]
  additional_restrictions?: string

  // Statut
  is_completed: boolean

  // Métadonnées
  created_at: string
  updated_at: string
}

// ==========================================
// PROGRAM FEEDBACK
// ==========================================

/**
 * Rating de difficulté
 * 1 = trop facile, 2 = facile, 3 = parfait, 4 = difficile, 5 = trop difficile
 */
export type DifficultyRating = 1 | 2 | 3 | 4 | 5

/**
 * Niveau d'énergie
 * 1 = épuisé, 2 = fatigué, 3 = normal, 4 = énergique, 5 = plein d'énergie
 */
export type EnergyLevel = 1 | 2 | 3 | 4 | 5

/**
 * Niveau de courbatures
 * 1 = aucune, 2 = légère, 3 = modérée, 4 = importante, 5 = intense
 */
export type MuscleSoreness = 1 | 2 | 3 | 4 | 5

/**
 * Niveau de motivation
 * 1 = démotivé, 5 = très motivé
 */
export type MotivationLevel = 1 | 2 | 3 | 4 | 5

/**
 * Qualité du sommeil
 * 1 = très mauvais, 5 = excellent
 */
export type SleepQuality = 1 | 2 | 3 | 4 | 5

/**
 * Niveau de stress
 * 1 = détendu, 5 = très stressé
 */
export type StressLevel = 1 | 2 | 3 | 4 | 5

/**
 * Exercice complété
 */
export interface CompletedExercise {
  exercise: string
  sets: number
  reps: number
  weight?: number
  duration_minutes?: number
  notes?: string
}

/**
 * Exercice sauté
 */
export interface SkippedExercise {
  exercise: string
  reason: string
}

/**
 * Exercice modifié
 */
export interface ModifiedExercise {
  exercise: string
  original_sets?: number
  actual_sets?: number
  original_reps?: number
  actual_reps?: number
  original_weight?: number
  actual_weight?: number
  reason: string
}

/**
 * Localisation de douleur
 */
export type PainLocation =
  | 'lower_back'
  | 'upper_back'
  | 'neck'
  | 'shoulders'
  | 'knees'
  | 'ankles'
  | 'wrists'
  | 'hips'
  | 'elbows'
  | 'other'

/**
 * Modification d'un exercice proposée par l'IA
 */
export interface ExerciseModification {
  exercise_name: string
  action: 'modify' | 'replace' | 'remove'
  new_sets?: number
  new_reps?: string
  new_rest_seconds?: number
  new_intensity?: 'Faible' | 'Modérée' | 'Élevée' | 'Maximale'
  replacement?: {
    exercise_name: string
    sets: number
    reps: string
    rest_seconds: number
    intensity: 'Faible' | 'Modérée' | 'Élevée' | 'Maximale'
    notes: string
    muscles_targeted: string[]
  }
  reason: string
}

/**
 * Suggestions d'adaptation générées par l'IA
 */
export interface AdaptationSuggestions {
  version: '1.0.0'
  type: 'weekly_adaptation' | 'cycle_generation'
  target_weeks: number[]
  source_week: number
  assessment: string
  intensity_direction: 'decrease' | 'maintain' | 'increase'
  volume_adjustment_percent: number
  exercise_modifications: ExerciseModification[]
  recommendations: string[]
  recovery_advice?: string
  warnings?: string[]
}

/**
 * Raison de skip d'un exercice (formulaire bilan)
 */
export interface SkipReasonEntry {
  exerciseName: string
  reason: 'equipment' | 'difficulty' | 'pain' | 'time' | 'other'
  note?: string
}

/**
 * Interface ProgramFeedback
 * Feedback hebdomadaire sur un programme d'entraînement
 */
export interface ProgramFeedback {
  id: string
  user_id: string
  program_id: string

  // Semaine
  week_number: number // 1-52
  feedback_date: string

  // Feedback utilisateur
  completion_rate?: number // 0-100%
  difficulty_rating?: DifficultyRating
  exercises_completed: CompletedExercise[]
  exercises_skipped: SkippedExercise[]
  exercises_modified: ModifiedExercise[]

  // Ressentis
  energy_level?: EnergyLevel
  muscle_soreness?: MuscleSoreness
  pain_or_discomfort?: string
  pain_locations: PainLocation[]
  overall_feeling?: string
  motivation_level?: MotivationLevel
  sleep_quality?: SleepQuality
  stress_level?: StressLevel

  // Notes
  notes?: string
  achievements?: string
  challenges?: string

  // Raisons de skip (formulaire bilan)
  skip_reasons?: SkipReasonEntry[]

  // Poids (suivi de progression)
  weight_kg?: number

  // Nutrition (si applicable)
  nutrition_adherence?: number // 0-100%

  // Ajustements IA
  ai_suggestions?: AdaptationSuggestions
  suggestions_applied: boolean
  applied_at?: string

  // Métadonnées
  created_at: string
  updated_at: string
}

/**
 * Statistiques de progression d'un programme
 */
export interface ProgramProgressStats {
  avg_completion_rate: number
  avg_difficulty_rating: number
  avg_energy_level: number
  total_weeks: number
  trend: 'improving' | 'declining' | 'stable'
}

/**
 * Types de signaux d'alarme détectés
 */
export type WarningType =
  | 'low_completion'
  | 'excessive_difficulty'
  | 'recurring_pain'
  | 'low_energy'

/**
 * Sévérité du signal d'alarme
 */
export type WarningSeverity = 'low' | 'medium' | 'high'

/**
 * Signal d'alarme détecté
 */
export interface WarningSign {
  warning_type: WarningType
  severity: WarningSeverity
  description: string
  last_occurrence: string
}

// ==========================================
// REVIEWS
// ==========================================

/**
 * Note de l'avis (1 à 5 étoiles)
 */
export type ReviewRating = 1 | 2 | 3 | 4 | 5

/**
 * Statut de modération de l'avis
 * - pending: En attente de modération
 * - approved: Publié (visible publiquement)
 * - rejected: Rejeté (invisible)
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

/**
 * Interface Review
 * Avis utilisateur avec note, commentaire, tags et modération
 */
export interface Review {
  id: string
  user_id: string

  // Contenu
  rating: ReviewRating
  comment: string
  tags: string[] // Noms des tags sélectionnés (max 3)

  // Modération
  status: ReviewStatus
  moderation_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  published_at?: string

  // Infos auteur (enrichies côté API pour affichage public)
  author?: ReviewAuthor

  // Métadonnées
  created_at: string
  updated_at: string
}

/**
 * Infos publiques de l'auteur d'un avis
 * Récupérées depuis user_profiles, questionnaire_responses, subscriptions
 */
export interface ReviewAuthor {
  first_name: string
  age?: number
  objective?: string         // Ex: "Perte de poids", "Prise de masse"
  fitness_level?: string     // Ex: "Débutant", "Intermédiaire"
  plan?: string              // Ex: "Coaching", "Coaching Pro"
}

/**
 * Interface ReviewTag
 * Tags prédéfinis pour catégoriser les avis
 */
export interface ReviewTag {
  id: string
  tag_name: string
  description?: string
  icon: string
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Statistiques agrégées des avis
 */
export interface ReviewStats {
  total_reviews: number
  avg_rating: number
  rating_distribution: Record<string, number>
}

// ==========================================
// PROMO CODES (Partenariats & Campagnes)
// ==========================================

/**
 * Statut d'un code promo
 * - active: Disponible, pas encore utilisé
 * - redeemed: Utilisé par un gagnant
 * - expired: Date d'expiration dépassée
 */
export type PromoCodeStatus = 'active' | 'redeemed' | 'expired'

/**
 * Interface PromoCode
 * Codes promotionnels pour partenariats (ex: Court Clash)
 * Permettent un accès gratuit sans carte bancaire
 */
export interface PromoCode {
  id: string
  code: string

  // Campagne
  campaign_id: string
  campaign_name?: string

  // Plan offert
  plan_id: PlanType
  discount_months: number

  // Rédemption
  redeemed_by_user_id?: string | null
  redeemed_at?: string | null
  status: PromoCodeStatus

  // Limites
  max_uses: number
  current_uses: number
  expires_at: string

  // Métadonnées
  notes?: string
  created_at: string
  updated_at: string
}

/**
 * Réponse de validation d'un code promo
 */
export interface PromoCodeValidation {
  valid: boolean
  promo_code_id?: string
  plan_id?: PlanType
  discount_months?: number
  campaign_name?: string
  error?: string
}

// =============================================
// AFFILIATE SYSTEM
// =============================================

export type AffiliateCategory = 'equipment' | 'nutrition' | 'clothing' | 'tech'

export interface AffiliatePartner {
  id: string
  name: string
  slug: string
  base_url: string
  commission_rate: number | null
  tracking_param: string
  tracking_value: string
  logo_url: string | null
  category: AffiliateCategory
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AffiliateClick {
  id: string
  user_id: string | null
  partner_id: string
  product_name: string
  product_url: string
  source_page: string
  source_component: string | null
  plan_id: string | null
  clicked_at: string
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
}

export interface AffiliateClickStats {
  partner_name: string
  partner_slug: string
  total_clicks: number
  unique_users: number
  clicks_last_7_days: number
  clicks_last_30_days: number
  top_products: Array<{ product_name: string; clicks: number }>
  clicks_by_page: Array<{ source_page: string; clicks: number }>
}
