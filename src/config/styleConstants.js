// FairLab Design System - basierend auf DESIGN_REQUIREMENTS.md

export const colors = {
  // Modul-Farben
  purple: '#8b5cf6',
  orange: '#f59e0b',
  green: '#22c55e',
  blue: '#3b82f6',
  red: '#ef4444',
  cyan: '#06b6d4',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',

  // Graustufen
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Status-Farben
  status: {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
    error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
    info: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  },

  // Bias-Score Farben
  bias: {
    negative: '#1e3a5f', // Anti-Stereotyp (blau)
    neutral: '#ffffff',
    positive: '#7f1d1d', // Pro-Stereotyp (rot)
  },
}

export const fontSizes = {
  xs: '10px',
  sm: '12px',
  base: '13px',
  md: '14px',
  lg: '15px',
  xl: '16px',
  '2xl': '18px',
  '3xl': '20px',
  '4xl': '24px',
  '5xl': '32px',
}

export const fontWeights = {
  normal: 400,
  semibold: 600,
  bold: 700,
}

export const spacing = {
  1: '4px',
  2: '6px',
  3: '8px',
  4: '10px',
  5: '12px',
  6: '14px',
  7: '16px',
  8: '20px',
  9: '24px',
  10: '30px',
  11: '40px',
  12: '50px',
}

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '10px',
  '2xl': '12px',
  '3xl': '14px',
  '4xl': '16px',
  '5xl': '20px',
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
}

// Gemeinsame Styles
export const baseStyles = {
  fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
  transition: 'all 0.2s ease',
}

export const layoutStyles = {
  header: {
    height: '60px',
    background: '#fff',
    borderBottom: `1px solid ${colors.gray[200]}`,
  },
  sidebar: {
    width: '280px',
    background: '#fff',
    borderRight: `1px solid ${colors.gray[200]}`,
  },
  content: {
    maxWidth: '1100px',
    padding: '40px 20px',
    margin: '0 auto',
  },
}

// Komponenten-Styles
export const componentStyles = {
  button: (variant = 'primary', size = 'md') => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 28px' : '10px 20px',
    fontSize: size === 'sm' ? fontSizes.sm : size === 'lg' ? fontSizes.lg : fontSizes.md,
    fontWeight: fontWeights.semibold,
    borderRadius: borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    transition: baseStyles.transition,
    fontFamily: baseStyles.fontFamily,
    ...(variant === 'primary' && {
      background: colors.purple,
      color: '#fff',
    }),
    ...(variant === 'secondary' && {
      background: colors.gray[100],
      color: colors.gray[700],
      border: `1px solid ${colors.gray[200]}`,
    }),
    ...(variant === 'danger' && {
      background: colors.red,
      color: '#fff',
    }),
    ...(variant === 'success' && {
      background: colors.green,
      color: '#fff',
    }),
  }),

  card: (isSelected = false, accentColor = colors.purple) => ({
    background: isSelected ? `${accentColor}15` : '#fff',
    borderRadius: borderRadius['4xl'],
    padding: spacing[8],
    border: isSelected ? `2px solid ${accentColor}` : `1px solid ${colors.gray[200]}`,
    cursor: 'pointer',
    transition: baseStyles.transition,
  }),

  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: fontSizes.md,
    border: `1px solid ${colors.gray[200]}`,
    borderRadius: borderRadius.md,
    fontFamily: baseStyles.fontFamily,
    transition: baseStyles.transition,
    outline: 'none',
  },

  label: {
    display: 'block',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.gray[700],
    marginBottom: spacing[2],
  },

  badge: (type = 'info') => ({
    display: 'inline-block',
    padding: '4px 10px',
    background: colors.status[type]?.bg || colors.gray[100],
    color: colors.status[type]?.text || colors.gray[700],
    borderRadius: borderRadius.md,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  }),

  iconContainer: (color = colors.purple) => ({
    width: '48px',
    height: '48px',
    borderRadius: borderRadius['2xl'],
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  }),

  detailPanel: (color = colors.purple) => ({
    background: '#fff',
    borderRadius: borderRadius['5xl'],
    padding: spacing[9],
    border: `2px solid ${color}`,
    position: 'sticky',
    top: spacing[8],
  }),

  placeholder: {
    background: colors.gray[100],
    borderRadius: borderRadius['5xl'],
    padding: '40px 24px',
    border: `2px dashed ${colors.gray[300]}`,
    textAlign: 'center',
    position: 'sticky',
    top: spacing[8],
  },

  table: {
    wrapper: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: fontSizes.base,
    },
    th: {
      padding: spacing[5],
      textAlign: 'left',
      borderBottom: `2px solid ${colors.gray[200]}`,
      color: colors.gray[500],
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    td: {
      padding: spacing[5],
      borderBottom: `1px solid ${colors.gray[200]}`,
      color: colors.gray[700],
    },
  },

  infoBox: (type = 'info') => ({
    padding: '16px 20px',
    borderRadius: borderRadius['2xl'],
    background: colors.status[type]?.bg || colors.gray[100],
    border: `1px solid ${colors.status[type]?.border || colors.gray[200]}`,
  }),

  tabs: {
    container: {
      display: 'flex',
      gap: spacing[1],
      borderBottom: `1px solid ${colors.gray[200]}`,
      marginBottom: spacing[9],
    },
    button: (isActive) => ({
      padding: '12px 20px',
      background: isActive ? '#fff' : 'transparent',
      border: 'none',
      borderBottom: isActive ? `3px solid ${colors.purple}` : '3px solid transparent',
      fontSize: fontSizes.md,
      fontWeight: isActive ? fontWeights.semibold : 500,
      color: isActive ? colors.purple : colors.gray[500],
      cursor: 'pointer',
      transition: baseStyles.transition,
      fontFamily: baseStyles.fontFamily,
    }),
  },
}

// Bias-Score zu Farbe
export const getBiasScoreColor = (score) => {
  if (score === 0) return colors.gray[400]
  if (score > 0) {
    const intensity = Math.min(Math.abs(score) / 100, 1)
    return `rgba(185, 28, 28, ${0.2 + intensity * 0.8})` // Rot für Pro-Stereotyp
  } else {
    const intensity = Math.min(Math.abs(score) / 100, 1)
    return `rgba(30, 58, 138, ${0.2 + intensity * 0.8})` // Blau für Anti-Stereotyp
  }
}

// Bias-Score zu Text
export const getBiasScoreLabel = (score) => {
  if (Math.abs(score) < 5) return 'Neutral'
  if (score > 0) return 'Pro-Stereotyp'
  return 'Anti-Stereotyp'
}
