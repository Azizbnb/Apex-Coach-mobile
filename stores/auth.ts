import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { profileApi, apiFetch } from '@/lib/api';
import type { Session, User } from '@supabase/supabase-js';
import type { Subscription as SupabaseSubscription } from '@supabase/supabase-js';
import type { UserProfile } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  cleanup: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

// Store the auth subscription outside Zustand for cleanup
let authListener: SupabaseSubscription | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      // Unsubscribe any previous listener (prevents duplicates on fast refresh)
      authListener?.unsubscribe();

      // Register listener BEFORE getSession to avoid race condition
      // (Supabase docs recommended pattern)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          set({
            user: session?.user ?? null,
            session: session ?? null,
          });

          if (session?.user) {
            get().fetchProfile().catch(() => {});
          } else {
            set({ profile: null });
          }
        }
      );
      authListener = subscription;

      // Now get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        set({ user: session.user, session });
        get().fetchProfile().catch(() => {});
      }
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  cleanup: () => {
    authListener?.unsubscribe();
    authListener = null;
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      set({ user: data.user, session: data.session });
      await get().fetchProfile();
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, profile: null });
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email: string) => {
    // Use branded email flow via Next.js API (Resend) instead of Supabase generic
    await apiFetch('/auth/send-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  fetchProfile: async () => {
    try {
      const profile = await profileApi.get();
      set({ profile });
    } catch {
      // Profile fetch failure is non-critical
    }
  },

  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },
}));
