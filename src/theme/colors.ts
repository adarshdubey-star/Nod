export const colors = {
  bg: '#0f1117',
  surface: '#1a1d27',
  orbStart: '#6366f1',
  orbEnd: '#8b5cf6',
  glow: '#818cf8',
  success: '#38bdf8',
  text: '#e2e8f0',
  muted: '#64748b',
  amber: '#f59e0b',
  border: '#2a2d3a',
} as const;

export type ColorKey = keyof typeof colors;
