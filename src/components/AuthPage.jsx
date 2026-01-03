import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { theme, styles } from '../lib/theme'

export default function AuthPage() {
  const { t, signIn, signUp, acceptInvite } = useApp()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('invite')
    if (token) {
      setInviteToken(token)
      setMode('signup')
    }
  }, [])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas')
        }
        await signUp(email, password, displayName || email.split('@')[0])
        
        if (inviteToken) {
          setTimeout(async () => {
            try {
              await acceptInvite(inviteToken)
            } catch (err) {
              console.error('Error accepting invite:', err)
            }
          }, 1000)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.card}>
        <div style={pageStyles.header}>
          <span style={pageStyles.emoji}>🍳</span>
          <h1 style={pageStyles.title}>Mes Recettes</h1>
          <p style={pageStyles.subtitle}>
            {mode === 'login' ? t('login') : t('signup')}
          </p>
        </div>
        
        {error && (
          <div style={pageStyles.error}>
            {error}
          </div>
        )}
        
        {inviteToken && mode === 'signup' && (
          <div style={pageStyles.inviteNotice}>
            🎉 Vous avez été invité à rejoindre un foyer !
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={pageStyles.form}>
          {mode === 'signup' && (
            <div style={pageStyles.field}>
              <label style={pageStyles.label}>{t('displayName')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jean"
                style={pageStyles.input}
              />
            </div>
          )}
          
          <div style={pageStyles.field}>
            <label style={pageStyles.label}>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
              style={pageStyles.input}
            />
          </div>
          
          <div style={pageStyles.field}>
            <label style={pageStyles.label}>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={pageStyles.input}
            />
          </div>
          
          {mode === 'signup' && (
            <div style={pageStyles.field}>
              <label style={pageStyles.label}>{t('confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={pageStyles.input}
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              ...pageStyles.submitButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t('loading') : (mode === 'login' ? t('loginButton') : t('signupButton'))}
          </button>
        </form>
        
        <div style={pageStyles.toggle}>
          <span style={pageStyles.toggleText}>
            {mode === 'login' ? t('noAccount') : t('hasAccount')}
          </span>
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={pageStyles.toggleButton}
          >
            {mode === 'login' ? t('createAccount') : t('login')}
          </button>
        </div>
      </div>
    </div>
  )
}

const pageStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.backgroundAlt} 100%)`,
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.lg,
    padding: '32px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  emoji: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: '28px',
    color: theme.colors.primary,
    margin: '0 0 4px 0',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: '15px',
    margin: 0,
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: theme.colors.error,
    padding: '12px 16px',
    borderRadius: theme.borderRadius.md,
    fontSize: '14px',
    marginBottom: '20px',
  },
  inviteNotice: {
    backgroundColor: '#DCFCE7',
    color: theme.colors.success,
    padding: '12px 16px',
    borderRadius: theme.borderRadius.md,
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    ...styles.input,
    padding: '14px 16px',
  },
  submitButton: {
    ...styles.buttonPrimary,
    width: '100%',
    padding: '14px',
    marginTop: '8px',
    fontSize: '16px',
  },
  toggle: {
    textAlign: 'center',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  toggleText: {
    color: theme.colors.textSecondary,
    fontSize: '14px',
  },
  toggleButton: {
    color: theme.colors.primary,
    fontSize: '14px',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '4px',
    textDecoration: 'underline',
  },
}