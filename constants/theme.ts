export const theme = {
  colors: {
    // Primary
    teal: '#21B6AD',

    // Pastels
    mint: '#DDF7F3',
    lavender: '#EEE8FF',
    purple: '#8A73D6',
    peach: '#FFF0E8',
    orange: '#FF8B5C',
    pink: '#FFE8F0',
    yellow: '#FFF4D7',

    // Accents
    pinkAccent: '#E86A9A',
    yellowAccent: '#F1B541',

    // Neutral
    background: '#F8FAFB',
    cardBackground: '#FFFFFF',
    border: '#E9EDF2',

    // Text
    text: '#172033',
    textSecondary: '#77808F',

    // Status
    success: '#35B77A',
    warning: '#F4AE3D',
    error: '#E75B5B',

    // Grayscale
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    gray: '#9CA3AF',
    darkGray: '#4B5563',
    black: '#000000',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  borderRadius: {
    card: 20,
    button: 16,
    input: 14,
    avatar: 12,
  },

  typography: {
    screenTitle: { fontSize: 28, fontWeight: '600' as const, lineHeight: 34 },
    sectionTitle: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
    cardHeadline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
    bodyLarge: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
    body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
    metadata: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
    largeStats: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
    label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  },

  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const trackingCardStyles = {
  feed: {
    backgroundColor: '#DDF7F3',
    textColor: '#0F6B62',
    borderColor: '#C8EEE8',
  },
  sleep: {
    backgroundColor: '#EEE8FF',
    textColor: '#5D4BA6',
    borderColor: '#D9CDF0',
  },
  nappy: {
    backgroundColor: '#FFF0E8',
    textColor: '#C85A2A',
    borderColor: '#FFDDD4',
  },
  pump: {
    backgroundColor: '#FFE8F0',
    textColor: '#C1466E',
    borderColor: '#FFD5E0',
  },
  tummy: {
    backgroundColor: '#FFF4D7',
    textColor: '#C19010',
    borderColor: '#FFEAD0',
  },
  medicine: {
    backgroundColor: '#EEE8FF',
    textColor: '#5D4BA6',
    borderColor: '#D9CDF0',
  },
  temperature: {
    backgroundColor: '#FFE8F0',
    textColor: '#C1466E',
    borderColor: '#FFD5E0',
  },
  growth: {
    backgroundColor: '#DDF7F3',
    textColor: '#0F6B62',
    borderColor: '#C8EEE8',
  },
  milestone: {
    backgroundColor: '#F1B541',
    textColor: '#8B6F1E',
    borderColor: '#E0A433',
  },
};
