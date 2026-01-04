import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, commonStyles } from '../lib/theme'

export default function AuthPage() {
  const { signIn, signUp, authError, clearAuthError, t } = useApp()
  
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, displayName)
      }
    } catch (error) {
      // Error is handled in context
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    clearAuthError()
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{t('auth.title')}</h1>
          <p style={styles.subtitle}>{t('auth.subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.field}>
              <label style={commonStyles.label}>{t('auth.displayName')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={styles.input}
                placeholder="Marie"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={commonStyles.label}>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="marie@exemple.com"
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={commonStyles.label}>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>

          {/* Error message */}
          {authError && (
            <div style={styles.error}>
              {t(authError)}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? t('common.loading') : (mode === 'login' ? t('auth.loginButton') : t('auth.signupButton'))}
          </button>
        </form>

        {/* Switch mode */}
        <button
          type="button"
          onClick={switchMode}
          style={styles.switchButton}
        >
          {mode === 'login' ? t('auth.switchToSignup') : t('auth.switchToLogin')}
        </button>
      </div>
    </div>
  )
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.cream
  },

  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    boxShadow: shadows.lg
  },

  header: {
    textAlign: 'center',
    marginBottom: spacing.xl
  },

  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['3xl'],
    fontWeight: 700,
    color: colors.forest,
    margin: 0,
    marginBottom: spacing.xs
  },

  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    margin: 0
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md
  },

  field: {
    display: 'flex',
    flexDirection: 'column'
  },

  input: {
    ...commonStyles.input,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSizes.md
  },

  error: {
    backgroundColor: colors.errorLight,
    color: colors.error,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: fontSizes.sm,
    textAlign: 'center'
  },

  submitButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary,
    width: '100%',
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: fontSizes.md,
    fontWeight: 700,
    marginTop: spacing.sm
  },

  switchButton: {
    width: '100%',
    marginTop: spacing.lg,
    padding: spacing.sm,
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.forest,
    fontSize: fontSizes.sm,
    cursor: 'pointer',
    fontFamily: fonts.body
  }
}