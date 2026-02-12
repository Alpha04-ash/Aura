export const Colors = {
  background: '#F9FAFB', // Slate 50 - Base Light
  white: '#FFFFFF',
  black: '#111827', // Slate 900

  // Brand Palette: Luminous Zen
  primary: '#818CF8', // Soft Indigo
  secondary: '#C084FC', // Soft Violet
  rose: '#F472B6', // Soft Rose


  // Functional Colors
  success: '#10B981', // Emerald 500
  error: '#EF4444', // Red 500

  // Growth OS Pastel Palette
  pastels: [
    '#E2E8F0', // Slate 200 (Default)
    '#FAE8FF', // Fuchsia 100
    '#F0FDF4', // Emerald 50
    '#FFF1F2', // Rose 50
    '#EFF6FF', // Blue 50
    '#FEF3C7', // Amber 100
  ],

  // Grays (Slate Scale)
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  text: {
    primary: '#0F172A', // Slate 900 (High Contrast)
    secondary: '#64748B', // Slate 500 (Readable Muted)
    muted: '#94A3B8', // Slate 400 (Subtle)
    inverse: '#FFFFFF',
  },

  // Gradients definition
  gradients: {
    // "Luminous Mesh" - The primary brand background
    luminous: ['#F8FAFC', '#E0E7FF', '#F3E8FF'] as const,
    // "Midnight Aura" - Dark mode or accent background
    midnight: ['#0F172A', '#1E1B4B', '#312E81'] as const,
    // "Rose Quartz" - Warm accent
    warm: ['#FFF1F2', '#FFE4E6', '#FECDD3'] as const,
    // Button/Action Gradient
    primary: ['#818CF8', '#A78BFA'] as const,
  }
};

export const LightColors = {
  background: '#F9FAFB',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  primary: '#818CF8',
  secondary: '#C084FC',
  error: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
  gray: Colors.gray,
};

export const DarkColors = {
  background: '#0F172A',
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0F172A',
  },
  card: '#1E293B',
  cardBorder: '#334155',
  primary: '#818CF8',
  secondary: '#C084FC',
  error: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
  gray: Colors.gray,
};

export type ThemeColors = typeof LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  mega: 64, // For significant whitespace
};

// "Swiss / Editorial" Typography Scale
export const Typography = {
  hero: {
    fontSize: 56, // Editorial Heading
    fontWeight: '800' as const,
    color: '#0F172A',
    letterSpacing: -1.5,
    lineHeight: 64,
  },
  h1: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#0F172A',
    letterSpacing: -1.0,
    lineHeight: 44,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: '#1E293B',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1E293B',
    letterSpacing: -0.25,
    lineHeight: 28,
  },
  bodyLarge: {
    fontSize: 18,
    color: '#334155',
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.0,
  },
};
