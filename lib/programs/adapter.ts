/**
 * Adapter entre le programme généré par l'IA (validé par WorkoutProgramSchema)
 * et les types mobile (Workout, Exercise) utilisés par le store workout + les UI.
 *
 * Le programme IA stocke :
 *   - `exercise_name` (string) → on mappe vers `Exercise.name`
 *   - `reps` (string, ex: "8-12", "AMRAP", "30s") → on parse vers `Exercise.reps` (number)
 *
 * Les `id` sont générés à partir des index (week/session/exercise) pour rester stables
 * tant que le programme n'est pas régénéré.
 */

import type { Workout, Exercise } from '@/types';

const DAY_ORDER: Record<string, number> = {
  Lundi: 1,
  Mardi: 2,
  Mercredi: 3,
  Jeudi: 4,
  Vendredi: 5,
  Samedi: 6,
  Dimanche: 7,
};

export interface AIExercise {
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  intensity?: string;
  notes?: string;
  muscles_targeted?: string[];
  tempo?: string;
  alternative_exercises?: string[];
  /** URL signée Supabase Storage pour la vidéo de démonstration */
  video_url?: string;
}

export interface AIWarmup {
  duration_minutes: number;
  exercises: string[];
  notes?: string;
}

export interface AICooldown {
  duration_minutes: number;
  exercises: string[];
  stretching_focus?: string[];
}

export interface AISession {
  day: string;
  session_number: number;
  type: string;
  duration_minutes: number;
  warmup: AIWarmup;
  main_workout: AIExercise[];
  cooldown: AICooldown;
  notes?: string;
  intensity_level?: number;
}

export interface AIWeek {
  week_number: number;
  focus: string;
  sessions: AISession[];
  progression_notes?: string;
}

export interface AIProgramData {
  title: string;
  description: string;
  duration_weeks: number;
  summary: string;
  weeks: AIWeek[];
}

/**
 * Extrait le premier entier d'une string reps (ex: "8-12" → 8, "AMRAP" → 0, "30s" → 30).
 * 0 signifie "à saisir par l'utilisateur" (cas AMRAP / au max).
 */
export function parseReps(repsRaw: string | number): number {
  if (typeof repsRaw === 'number') return repsRaw;
  const match = repsRaw.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Convertit un exercice IA en Exercise mobile (id stable basé sur les index).
 */
export function aiExerciseToExercise(
  ai: AIExercise,
  weekNumber: number,
  sessionIndex: number,
  exerciseIndex: number
): Exercise {
  return {
    id: `w${weekNumber}-s${sessionIndex}-e${exerciseIndex}`,
    name: ai.exercise_name,
    sets: ai.sets,
    reps: parseReps(ai.reps),
    rest_seconds: ai.rest_seconds,
    notes: ai.notes,
  };
}

/**
 * Convertit une session IA en Workout mobile prêt pour `useWorkout().startSession()`.
 * Seul `main_workout` est inclus dans `exercises[]` — le warmup/cooldown reste
 * consultable séparément via la session brute (modal session-detail).
 */
export function aiSessionToWorkout(
  session: AISession,
  weekNumber: number,
  sessionIndex: number,
  userId: string,
  scheduledFor?: string
): Workout {
  const now = new Date().toISOString();
  return {
    id: `w${weekNumber}-s${sessionIndex}`,
    user_id: userId,
    title: `Semaine ${weekNumber} — ${session.type}`,
    description: session.notes,
    exercises: session.main_workout.map((ex, idx) =>
      aiExerciseToExercise(ex, weekNumber, sessionIndex, idx)
    ),
    duration: session.duration_minutes,
    difficulty:
      session.intensity_level && session.intensity_level >= 8
        ? 'hard'
        : session.intensity_level && session.intensity_level <= 4
          ? 'easy'
          : 'medium',
    completed: false,
    scheduled_for: scheduledFor,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Trie les sessions d'une semaine par jour (Lundi → Dimanche), puis par session_number.
 */
export function sortSessions(sessions: AISession[]): AISession[] {
  return [...sessions].sort((a, b) => {
    const dayDiff = (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99);
    if (dayDiff !== 0) return dayDiff;
    return a.session_number - b.session_number;
  });
}

/**
 * Garde-fou type-narrowing : program_data du store est `unknown`.
 * Renvoie null si la structure n'est pas reconnaissable (programme ancien, mal formé).
 */
export function isAIProgramData(value: unknown): value is AIProgramData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === 'string' &&
    typeof v.duration_weeks === 'number' &&
    Array.isArray(v.weeks)
  );
}
