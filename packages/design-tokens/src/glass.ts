/**
 * NEXA Ecosystem — Liquid Glass Tokens
 * Especificação matemática e de renderização para materiais translúcidos
 */

export const glassTokens = {
  blur: {
    sm: '8px',
    md: '16px',
    lg: '28px',
    hero: '40px',
  },
  opacity: {
    clear: 0.12,
    regular: 0.28,
    dense: 0.55,
    solid: 0.88,
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.12)',
    prominent: 'rgba(255, 255, 255, 0.25)',
    specular: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
  shadow: {
    soft: '0 8px 32px 0 rgba(0, 0, 0, 0.18)',
    deep: '0 20px 50px 0 rgba(0, 0, 0, 0.35)',
    inset: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)',
  },
  radius: {
    sm: '10px',
    md: '18px',
    lg: '26px',
    pill: '9999px',
  },
} as const;

export type GlassTokens = typeof glassTokens;
