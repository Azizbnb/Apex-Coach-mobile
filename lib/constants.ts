/**
 * APEX COACH MOBILE — Constantes centralisées
 *
 * Source de vérité pour les couleurs, URLs, et configurations.
 * Les couleurs doivent correspondre exactement au web (globals.css).
 */

// ============================================
// COULEURS (alignées sur le web app)
// ============================================

export const colors = {
  // Palette noire (fonds, surfaces)
  black: {
    900: '#0A0E1A', // Fond principal
    800: '#111827', // Cartes, surfaces
    700: '#1F2937', // Bordures
    600: '#374151', // Bordures secondaires
    500: '#6B7280', // Texte désactivé
    400: '#9CA3AF', // Texte secondaire
    300: '#D1D5DB', // Texte tertiaire
    200: '#E5E7EB',
    100: '#F3F4F6',
  },

  // Palette lime (primaire, CTAs, accents)
  lime: {
    900: '#365314',
    700: '#4D7C0F',
    600: '#65A30D', // Pressed state
    500: '#84CC16', // Primaire — CTAs, accents, tab active
    400: '#A3E635',
    300: '#BEF264',
    200: '#D9F99D',
    100: '#ECFCCB',
  },

  white: '#FAFAF9',

  // Statut
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// ============================================
// API
// ============================================

// Host canonique = www. L'apex `apexcoach.app` répond en 307 vers www, ce qui
// fait crasher la couche réseau native iOS sur les POST (le body est rejoué
// pendant la redirection). Toujours partir de www → zéro redirection.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://www.apexcoach.app';

// ============================================
// DEEP LINKING
// ============================================

export const DEEP_LINK_SCHEME = 'apexcoach';
export const UNIVERSAL_LINK_HOST = 'apexcoach.app';

// ============================================
// TAB BAR
// ============================================

export const TAB_BAR = {
  activeColor: colors.lime[500],
  inactiveColor: colors.black[400],
  backgroundColor: colors.black[900],
  borderColor: colors.black[700],
  height: 72,
} as const;

// ============================================
// SPLASH / BACKGROUNDS
// ============================================

export const BACKGROUND_COLOR = colors.black[900];
