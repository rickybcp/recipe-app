// ============================================
// DESIGN TOKENS
// ============================================

export const colors = {
    // Primary palette
    forest: '#2D5A3D',
    forestLight: '#3D7A52',
    forestDark: '#1D4A2D',
    
    // Accent colors
    terracotta: '#C17A5E',
    terracottaLight: '#D4917A',
    gold: '#D4A853',
    goldLight: '#E5C17A',
    
    // Neutrals
    cream: '#FAF8F5',
    warmGray: '#E8E4DE',
    warmGrayDark: '#D1CCC4',
    
    // Text
    textPrimary: '#2D3748',
    textSecondary: '#5A6578',
    textMuted: '#8A92A0',
    
    // Semantic
    white: '#FFFFFF',
    error: '#C75050',
    errorLight: '#FEF2F2',
    success: '#2D5A3D',
    successLight: '#F0F7F2'
  }
  
  export const fonts = {
    body: "'Nunito', sans-serif",
    heading: "'Playfair Display', serif"
  }
  
  export const fontSizes = {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  }
  
  export const spacing = {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem'   // 48px
  }
  
  export const borderRadius = {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px'
  }
  
  export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
  }
  
  // ============================================
  // COMMON STYLES
  // ============================================
  
  export const commonStyles = {
    // Buttons
    buttonBase: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      fontWeight: 600,
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: borderRadius.md,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm
    },
    
    buttonPrimary: {
      backgroundColor: colors.forest,
      color: colors.white
    },
    
    buttonSecondary: {
      backgroundColor: colors.warmGray,
      color: colors.textPrimary
    },
    
    buttonDanger: {
      backgroundColor: colors.error,
      color: colors.white
    },
    
    // Inputs
    input: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      border: `1px solid ${colors.warmGrayDark}`,
      backgroundColor: colors.white,
      color: colors.textPrimary,
      width: '100%',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    
    // Cards
    card: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      boxShadow: shadows.sm
    },
    
    // Labels
    label: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      fontWeight: 600,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      display: 'block'
    }
  }
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  export function getSeasonColor(season) {
    const seasonColors = {
      winter: '#5B8DD9',
      spring: '#7BC47F',
      summer: '#F4D03F',
      autumn: '#E67E22'
    }
    return seasonColors[season] || colors.warmGray
  }
  
  export function getDifficultyColor(difficulty) {
    const difficultyColors = {
      easy: colors.success,
      medium: colors.gold,
      hard: colors.terracotta
    }
    return difficultyColors[difficulty] || colors.textMuted
  }