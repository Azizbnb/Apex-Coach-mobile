import type { PlanType } from '@/types'

// ==========================================
// CONFIGURATION
// ==========================================

/**
 * Configuration du déverrouillage progressif des semaines
 *
 * - Semaine 1 : Débloquée immédiatement (J+0)
 * - Semaine 2 : Débloquée à J+7
 * - Semaine 3 : Débloquée à J+14
 * - Semaine 4 : Débloquée à J+21
 */
export const PROGRESSIVE_UNLOCK_CONFIG = {
  /** Nombre de jours avant déverrouillage de chaque semaine */
  unlockSchedule: {
    1: 0,   // Semaine 1 : Immédiat
    2: 7,   // Semaine 2 : J+7
    3: 14,  // Semaine 3 : J+14
    4: 21,  // Semaine 4 : J+21
  } as Record<number, number>,

  /** Plans utilisant le déverrouillage progressif */
  progressivePlans: ['coaching', 'coaching_pro'] as PlanType[],

  /** Plans avec accès immédiat à tout le programme */
  immediatePlans: ['starter'] as PlanType[],

  /** Nombre total de semaines dans un programme */
  totalWeeks: 4,

  /** Nombre de jours entre chaque déverrouillage */
  daysPerUnlock: 7,
} as const

// ==========================================
// TYPES
// ==========================================

/**
 * Statut de déverrouillage d'une semaine
 */
export interface WeekUnlockStatus {
  /** Numéro de la semaine (1-4) */
  weekNumber: number
  /** La semaine est-elle déverrouillée ? */
  isUnlocked: boolean
  /** Date de déverrouillage de la semaine */
  unlockDate: Date
  /** Jours restants avant déverrouillage (null si déjà déverrouillée) */
  daysUntilUnlock: number | null
  /** Heures restantes (après les jours complets) */
  hoursUntilUnlock: number | null
  /** Le bilan de la semaine précédente est-il requis ? (true pour semaines 2+) */
  requiresBilan: boolean
  /** Le bilan de la semaine précédente est-il rempli ? */
  previousBilanCompleted: boolean | null
}

/**
 * Informations complètes sur le déverrouillage progressif
 */
export interface ProgressiveUnlockInfo {
  /** Date de début de l'abonnement (référence pour les calculs) */
  subscriptionStartDate: Date
  /** Semaine actuelle (plus haute semaine déverrouillée) */
  currentWeek: number
  /** Nombre total de semaines dans le programme */
  totalWeeks: number
  /** Statut de chaque semaine */
  weeks: WeekUnlockStatus[]
  /** Informations sur le prochain déverrouillage (null si tout est déverrouillé) */
  nextUnlock: {
    weekNumber: number
    date: Date
    daysRemaining: number
    hoursRemaining: number
  } | null
  /** Toutes les semaines sont-elles déverrouillées ? */
  allUnlocked: boolean
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

/**
 * Détermine si un plan utilise le déverrouillage progressif
 *
 * @param planId - Type de plan (starter, coaching, coaching_pro)
 * @returns true si le plan utilise le déverrouillage progressif
 */
export function shouldApplyProgressiveUnlock(planId: PlanType | null): boolean {
  if (!planId) return false
  return PROGRESSIVE_UNLOCK_CONFIG.progressivePlans.includes(planId)
}

/**
 * Calcule la date de déverrouillage d'une semaine
 *
 * @param subscriptionStartDate - Date de début de l'abonnement
 * @param weekNumber - Numéro de la semaine (1-4)
 * @returns Date de déverrouillage de la semaine
 */
export function getUnlockDateForWeek(
  subscriptionStartDate: Date,
  weekNumber: number
): Date {
  const daysToAdd = PROGRESSIVE_UNLOCK_CONFIG.unlockSchedule[weekNumber] ??
    (weekNumber - 1) * PROGRESSIVE_UNLOCK_CONFIG.daysPerUnlock

  const unlockDate = new Date(subscriptionStartDate)
  unlockDate.setDate(unlockDate.getDate() + daysToAdd)

  // Réinitialiser à minuit UTC pour cohérence
  unlockDate.setUTCHours(0, 0, 0, 0)

  return unlockDate
}

/**
 * Vérifie si une semaine est déverrouillée
 *
 * @param subscriptionStartDate - Date de début de l'abonnement
 * @param weekNumber - Numéro de la semaine (1-4)
 * @param currentDate - Date actuelle (optionnel, pour les tests)
 * @returns true si la semaine est déverrouillée
 */
export function isWeekUnlocked(
  subscriptionStartDate: Date,
  weekNumber: number,
  currentDate: Date = new Date()
): boolean {
  const unlockDate = getUnlockDateForWeek(subscriptionStartDate, weekNumber)
  return currentDate >= unlockDate
}

/**
 * Calcule le temps restant avant déverrouillage d'une semaine
 *
 * @param unlockDate - Date de déverrouillage
 * @param currentDate - Date actuelle
 * @returns Objet avec jours et heures restants, ou null si déjà déverrouillée
 */
export function getTimeUntilUnlock(
  unlockDate: Date,
  currentDate: Date = new Date()
): { days: number; hours: number; minutes: number } | null {
  const msRemaining = unlockDate.getTime() - currentDate.getTime()

  if (msRemaining <= 0) {
    return null
  }

  const totalMinutes = Math.floor(msRemaining / (1000 * 60))
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = totalMinutes % 60

  return { days, hours, minutes }
}

/**
 * Calcule le statut de déverrouillage d'une semaine (sans info bilan)
 *
 * @param subscriptionStartDate - Date de début de l'abonnement
 * @param weekNumber - Numéro de la semaine
 * @param currentDate - Date actuelle (optionnel)
 * @returns Statut complet de la semaine
 */
export function getWeekUnlockStatus(
  subscriptionStartDate: Date,
  weekNumber: number,
  currentDate: Date = new Date()
): WeekUnlockStatus {
  const unlockDate = getUnlockDateForWeek(subscriptionStartDate, weekNumber)
  const timeUnlocked = currentDate >= unlockDate
  const timeRemaining = timeUnlocked ? null : getTimeUntilUnlock(unlockDate, currentDate)
  const requiresBilan = weekNumber > 1

  return {
    weekNumber,
    isUnlocked: timeUnlocked, // Sans bilan info, on considère seulement le temps
    unlockDate,
    daysUntilUnlock: timeRemaining?.days ?? null,
    hoursUntilUnlock: timeRemaining?.hours ?? null,
    requiresBilan,
    previousBilanCompleted: null, // Non renseigné sans contexte DB
  }
}

/**
 * Calcule le statut de déverrouillage d'une semaine avec vérification du bilan
 *
 * @param subscriptionStartDate - Date de début de l'abonnement
 * @param weekNumber - Numéro de la semaine
 * @param bilanCompletedWeeks - Liste des semaines pour lesquelles le bilan est rempli
 * @param currentDate - Date actuelle (optionnel)
 * @returns Statut complet de la semaine avec info bilan
 */
export function getWeekUnlockStatusWithBilan(
  subscriptionStartDate: Date,
  weekNumber: number,
  bilanCompletedWeeks: number[],
  currentDate: Date = new Date()
): WeekUnlockStatus {
  const unlockDate = getUnlockDateForWeek(subscriptionStartDate, weekNumber)
  const timeUnlocked = currentDate >= unlockDate
  const timeRemaining = timeUnlocked ? null : getTimeUntilUnlock(unlockDate, currentDate)
  const requiresBilan = weekNumber > 1
  const previousBilanCompleted = requiresBilan
    ? bilanCompletedWeeks.includes(weekNumber - 1)
    : true

  // La semaine est déverrouillée si le temps est passé ET le bilan précédent est rempli
  const isUnlocked = timeUnlocked && (requiresBilan ? previousBilanCompleted : true)

  return {
    weekNumber,
    isUnlocked,
    unlockDate,
    daysUntilUnlock: timeRemaining?.days ?? null,
    hoursUntilUnlock: timeRemaining?.hours ?? null,
    requiresBilan,
    previousBilanCompleted,
  }
}

/**
 * Vérifie si une semaine est déverrouillée (avec vérification du bilan)
 *
 * @param subscriptionStartDate - Date de début de l'abonnement
 * @param weekNumber - Numéro de la semaine (1-4)
 * @param bilanCompletedWeeks - Liste des semaines pour lesquelles le bilan est rempli
 * @param currentDate - Date actuelle (optionnel)
 * @returns true si la semaine est déverrouillée
 */
export function isWeekUnlockedWithBilan(
  subscriptionStartDate: Date,
  weekNumber: number,
  bilanCompletedWeeks: number[],
  currentDate: Date = new Date()
): boolean {
  // Semaine 1 : pas de bilan requis
  if (weekNumber === 1) {
    return isWeekUnlocked(subscriptionStartDate, weekNumber, currentDate)
  }

  // Semaines 2+ : temps passé ET bilan semaine précédente rempli
  const timeUnlocked = isWeekUnlocked(subscriptionStartDate, weekNumber, currentDate)
  const previousBilanCompleted = bilanCompletedWeeks.includes(weekNumber - 1)

  return timeUnlocked && previousBilanCompleted
}

// ==========================================
// FONCTION PRINCIPALE
// ==========================================

/**
 * Récupère les informations complètes de déverrouillage progressif
 *
 * @param subscriptionStartDate - Date de début de l'abonnement
 * @param totalWeeks - Nombre total de semaines (défaut: 4)
 * @param currentDate - Date actuelle (optionnel, pour les tests)
 * @returns Informations complètes sur le déverrouillage
 *
 * @example
 * ```ts
 * const info = getProgressiveUnlockInfo(new Date('2026-01-15'), 4)
 * // Le 15 janvier : semaine 1 déverrouillée
 * // Le 22 janvier : semaines 1 et 2 déverrouillées
 * // etc.
 * ```
 */
export function getProgressiveUnlockInfo(
  subscriptionStartDate: Date,
  totalWeeks: number = PROGRESSIVE_UNLOCK_CONFIG.totalWeeks,
  currentDate: Date = new Date()
): ProgressiveUnlockInfo {
  // Calculer le statut de chaque semaine
  const weeks: WeekUnlockStatus[] = []
  let currentWeek = 0
  let nextUnlockWeek: WeekUnlockStatus | null = null

  for (let i = 1; i <= totalWeeks; i++) {
    const status = getWeekUnlockStatus(subscriptionStartDate, i, currentDate)
    weeks.push(status)

    if (status.isUnlocked) {
      currentWeek = i
    } else if (!nextUnlockWeek) {
      nextUnlockWeek = status
    }
  }

  // Calculer les infos du prochain déverrouillage
  const nextUnlock = nextUnlockWeek ? {
    weekNumber: nextUnlockWeek.weekNumber,
    date: nextUnlockWeek.unlockDate,
    daysRemaining: nextUnlockWeek.daysUntilUnlock ?? 0,
    hoursRemaining: nextUnlockWeek.hoursUntilUnlock ?? 0,
  } : null

  return {
    subscriptionStartDate,
    currentWeek,
    totalWeeks,
    weeks,
    nextUnlock,
    allUnlocked: currentWeek >= totalWeeks,
  }
}

/**
 * Récupère les informations de déverrouillage avec vérification du bilan
 *
 * Cette version prend en compte les bilans remplis pour déterminer
 * si une semaine est vraiment accessible.
 *
 * @param subscriptionStartDate - Date de début de l'abonnement
 * @param bilanCompletedWeeks - Liste des semaines pour lesquelles le bilan est rempli
 * @param totalWeeks - Nombre total de semaines (défaut: 4)
 * @param currentDate - Date actuelle (optionnel)
 * @returns Informations complètes sur le déverrouillage
 */
export function getProgressiveUnlockInfoWithBilan(
  subscriptionStartDate: Date,
  bilanCompletedWeeks: number[],
  totalWeeks: number = PROGRESSIVE_UNLOCK_CONFIG.totalWeeks,
  currentDate: Date = new Date()
): ProgressiveUnlockInfo {
  const weeks: WeekUnlockStatus[] = []
  let currentWeek = 0
  let nextUnlockWeek: WeekUnlockStatus | null = null

  for (let i = 1; i <= totalWeeks; i++) {
    const status = getWeekUnlockStatusWithBilan(
      subscriptionStartDate,
      i,
      bilanCompletedWeeks,
      currentDate
    )
    weeks.push(status)

    if (status.isUnlocked) {
      currentWeek = i
    } else if (!nextUnlockWeek) {
      nextUnlockWeek = status
    }
  }

  const nextUnlock = nextUnlockWeek ? {
    weekNumber: nextUnlockWeek.weekNumber,
    date: nextUnlockWeek.unlockDate,
    daysRemaining: nextUnlockWeek.daysUntilUnlock ?? 0,
    hoursRemaining: nextUnlockWeek.hoursUntilUnlock ?? 0,
  } : null

  return {
    subscriptionStartDate,
    currentWeek,
    totalWeeks,
    weeks,
    nextUnlock,
    allUnlocked: currentWeek >= totalWeeks,
  }
}

// ==========================================
// HELPERS POUR AFFICHAGE
// ==========================================

/**
 * Formate une date en français
 *
 * @param date - Date à formater
 * @returns Date formatée (ex: "22 janvier 2026")
 */
export function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formate le temps restant avant déverrouillage
 *
 * @param days - Jours restants
 * @param hours - Heures restantes
 * @returns Texte formaté (ex: "3 jours", "5 heures")
 */
export function formatTimeRemaining(days: number, hours: number): string {
  if (days > 0) {
    return `${days} jour${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`
  }
  return 'Bientôt disponible'
}

/**
 * Crée un objet ProgressiveUnlockInfo pour un plan avec accès immédiat (Starter)
 * Toutes les semaines sont marquées comme déverrouillées
 *
 * @param totalWeeks - Nombre total de semaines
 * @returns Infos avec toutes les semaines déverrouillées
 */
export function createFullyUnlockedInfo(
  totalWeeks: number = PROGRESSIVE_UNLOCK_CONFIG.totalWeeks
): ProgressiveUnlockInfo {
  const now = new Date()
  const weeks: WeekUnlockStatus[] = []

  for (let i = 1; i <= totalWeeks; i++) {
    weeks.push({
      weekNumber: i,
      isUnlocked: true,
      unlockDate: now,
      daysUntilUnlock: null,
      hoursUntilUnlock: null,
      requiresBilan: i > 1,
      previousBilanCompleted: true, // Considéré comme rempli pour Starter
    })
  }

  return {
    subscriptionStartDate: now,
    currentWeek: totalWeeks,
    totalWeeks,
    weeks,
    nextUnlock: null,
    allUnlocked: true,
  }
}

// ==========================================
// HELPERS POUR L'AFFICHAGE ENRICHI
// ==========================================

/**
 * Calcule le pourcentage de programme déverrouillé
 *
 * @param info - Informations de déverrouillage progressif
 * @returns Pourcentage (0-100)
 *
 * @example
 * ```ts
 * const info = getProgressiveUnlockInfo(startDate, 4)
 * const percentage = getUnlockPercentage(info) // 25, 50, 75, 100
 * ```
 */
export function getUnlockPercentage(info: ProgressiveUnlockInfo): number {
  return Math.round((info.currentWeek / info.totalWeeks) * 100)
}

/**
 * Génère un message d'encouragement basé sur la progression
 *
 * @param info - Informations de déverrouillage progressif
 * @returns Message contextuel en français
 *
 * @example
 * ```ts
 * const info = getProgressiveUnlockInfo(startDate, 4)
 * const message = getProgressMessage(info)
 * // "Semaine 2 en cours - Semaine 3 bientôt disponible"
 * ```
 */
export function getProgressMessage(info: ProgressiveUnlockInfo): string {
  if (info.allUnlocked) {
    return 'Programme complet débloqué !'
  }

  const nextWeek = info.nextUnlock?.weekNumber
  if (!nextWeek) {
    return `${info.currentWeek}/${info.totalWeeks} semaines disponibles`
  }

  return `Semaine ${info.currentWeek} en cours - Semaine ${nextWeek} bientôt disponible`
}
