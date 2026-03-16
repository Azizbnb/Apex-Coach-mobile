/**
 * APEX COACH MOBILE - API Client
 *
 * Sprint 1: Direct Supabase queries (RLS protects data)
 * Sprint 2: Will add apiFetch() for Next.js API routes with Bearer token
 */

import { supabase } from '@/lib/supabase/client';
import type {
  UserProfile,
  Subscription,
  NutritionPreferences,
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

const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

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

  return response.json();
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

  async getNutritionPlan() {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('programs')
      .select('nutrition_plan')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    return data?.nutrition_plan || null;
  },
};

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
