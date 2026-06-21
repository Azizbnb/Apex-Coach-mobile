/**
 * APEX COACH MOBILE - API Client
 *
 * Sprint 1: Direct Supabase queries (RLS protects data)
 * Sprint 2: Will add apiFetch() for Next.js API routes with Bearer token
 */

import { supabase } from '@/lib/supabase/client';
import { API_URL } from '@/lib/constants';
import type {
  UserProfile,
  Subscription,
  NutritionPreferences,
  NutritionPlan,
  ExerciseVideoData,
} from '@/types';

// ============================================
// ERROR HANDLING
// ============================================

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================
// SPRINT 2 — API FETCH (préparé pour Bearer token)
// ============================================

// Host canonique (www). Viser l'apex `apexcoach.app` déclenche un 307 vers
// www qui rejoue le body POST → crash natif réseau sur iOS (Expo Go / New
// Architecture). On part donc toujours du host final, sans redirection.
const API_BASE = API_URL;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.error || 'Request failed', error);
  }

  // Tolère un corps vide (ex: certaines routes POST renvoient 200/204 sans JSON).
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ============================================
// SPRINT 1 — DIRECT SUPABASE QUERIES
// ============================================

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new ApiError(401, 'Non authentifié');
  return user.id;
}

// --- Profile ---

export const profileApi = {
  async get(): Promise<UserProfile | null> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    return data;
  },

  async update(updates: Partial<UserProfile>): Promise<UserProfile> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw new ApiError(500, error.message);
    return data;
  },
};

// --- Subscription ---

export const subscriptionApi = {
  async getCurrent(): Promise<Subscription | null> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    return data;
  },
};

// --- Program ---

export const programApi = {
  async getCurrent() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    return data;
  },

  async getStatus() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('programs')
      .select('id, status, duration_weeks, start_date, title, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    return data;
  },
};

// --- Nutrition ---

export const nutritionApi = {
  async getPreferences(): Promise<NutritionPreferences | null> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('nutrition_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    return data;
  },

  async getNutritionPlan(): Promise<NutritionPlan | null> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('programs')
      .select('nutrition_plan')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    return (data?.nutrition_plan as NutritionPlan) || null;
  },

  /** Statut de génération du plan nutrition (dérivé du dernier programme). */
  async getGenerationStatus(): Promise<NutritionGenerationStatus | null> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('programs')
      .select('id, status, nutrition_generation_failed')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) return null;
    return {
      programId: data.id,
      status: data.status,
      nutritionFailed: !!data.nutrition_generation_failed,
    };
  },

  /** Relance la génération du plan nutrition (Pro, programme complété). */
  async retryNutrition(programId: string): Promise<void> {
    await apiFetch('/programs/retry-nutrition', {
      method: 'POST',
      body: JSON.stringify({ programId }),
    });
  },
};

export interface NutritionGenerationStatus {
  programId: string;
  status: string;
  nutritionFailed: boolean;
}

// --- Feedback (Sprint 2: via API route for AI processing) ---

export const feedbackApi = {
  async getForProgram(programId: string) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('program_feedback')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .order('week_number', { ascending: true });
    if (error) throw new ApiError(500, error.message);
    return data || [];
  },
};

// --- Affiliate ---

export const affiliateApi = {
  async trackClick(data: {
    partner_slug: string;
    product_name: string;
    product_url: string;
    source_page: string;
    source_component: string;
  }) {
    return apiFetch('/affiliate/track-click', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// --- Reviews ---

export const reviewsApi = {
  async getPublic(page = 1) {
    return apiFetch(`/reviews/public?page=${page}`);
  },
};

// --- Exercices (démo vidéo MuscleWiki) ---
// Route web existante : GET /api/exercises/video?name=<nom>
// → { success: true, video: ExerciseVideoData | null }. Aucune logique backend ajoutée.

export const exercisesApi = {
  /**
   * Récupère la démo vidéo d'un exercice par son nom (recherche MuscleWiki
   * côté serveur, cache 1h). Renvoie `null` si aucune vidéo n'est trouvée.
   */
  async getVideo(name: string): Promise<ExerciseVideoData | null> {
    const data = await apiFetch<{ video: ExerciseVideoData | null }>(
      `/exercises/video?name=${encodeURIComponent(name)}`
    );
    return data?.video ?? null;
  },
};

// --- Account (RGPD + suppression) ---
// Routes web existantes — aucune logique backend ajoutée côté mobile.

export const accountApi = {
  /**
   * Export RGPD (Art. 15) — GET /api/gdpr/export.
   * Le serveur renvoie l'intégralité des données utilisateur en JSON (self-service).
   */
  async exportGdprData(): Promise<unknown> {
    return apiFetch('/gdpr/export');
  },

  /**
   * Suppression de compte (Art. 17) — POST /api/user/delete-account.
   * Re-authentification serveur par mot de passe ; purge/anonymisation async.
   */
  async deleteAccount(password: string): Promise<void> {
    await apiFetch('/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};
