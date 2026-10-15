/**
 * NEXA Ecosystem — Paletas de Cores por Aplicação
 */

export const colorTokens = {
  // NEXA Pay: Glacial Navy / Private Bank
  pay: {
    bgDark: '#030712',
    bgNavy: '#0A192F',
    surface: 'rgba(10, 25, 47, 0.75)',
    accentSky: '#38BDF8',
    accentBlue: '#0284C7',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },

  // NEXA Mobile: Pearl White / Space Silver / Indigo Cinema
  mobile: {
    bgDark: '#0B0F19',
    bgLight: '#F8FAFC',
    surface: 'rgba(255, 255, 255, 0.08)',
    surfaceSolid: '#FFFFFF',
    accentIndigo: '#6366F1',
    accentElectric: '#818CF8',
    textPrimary: '#0F172A',
    textDarkPrimary: '#F8FAFC',
    textMuted: '#64748B',
  },

  // NEXA Chat: Slate / Muted Iris / Deep Graphite
  chat: {
    bgDark: '#090D16',
    surface: 'rgba(17, 24, 39, 0.8)',
    accentIris: '#818CF8',
    accentPurple: '#A855F7',
    bubbleSent: '#4F46E5',
    bubbleReceived: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#F1F5F9',
    textMuted: '#94A3B8',
  },
} as const;

export type ColorTokens = typeof colorTokens;
