/**
 * NEXA Ecosystem — Dinâmicas de Movimento e Spring Physics
 */

export const motionTokens = {
  timing: {
    instant: 120,
    interactive: 220,
    standard: 340,
    cinematic: 650,
  },
  easing: {
    standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  spring: {
    snappy: { stiffness: 400, damping: 28 },
    gentle: { stiffness: 200, damping: 20 },
    bouncy: { stiffness: 350, damping: 15 },
  },
} as const;

export type MotionTokens = typeof motionTokens;
