// Centralized design tokens for the Convoy app.
// All colors, spacing, typography and radii live here so screens stay consistent.

export const colors = {
  // Surfaces
  background: '#0B0F14',
  surface: '#141A22',
  surfaceElevated: '#1B232D',
  surfaceMuted: '#0F141B',
  border: '#1F2A35',
  divider: '#22303C',

  // Text
  textPrimary: '#F5F7FA',
  textSecondary: '#A6B3C2',
  textMuted: '#6B7886',

  // Accents
  primary: '#5EE3D6',
  primaryDark: '#2BB8AB',
  accent: '#FF6A3D',
  accentDark: '#D9512A',

  // States
  success: '#4ADE80',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Overlays
  overlay: 'rgba(0,0,0,0.55)',
  glow: 'rgba(94,227,214,0.18)',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '500' },
  bodySm: { fontSize: 13, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
  button: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  glow: {
    shadowColor: '#5EE3D6',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
};

export const theme = { colors, spacing, radii, typography, shadows };

export default theme;
