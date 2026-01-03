import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { theme, styles } from '../lib/theme'

export default function HouseholdSetup() {
  const { t, user, signOut, createHousehold, acceptInvite } = useApp()
  const [mode, setMode] = useState('choice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [householdName, setHouseholdName] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('invite')
    if (token) {
      setInviteToken(token)
      setMode('join')
    }
  }, [])
  
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!householdName.trim()) return
    
    setError('')
    setLoading(true)
    
    try {
      await createHousehold(householdName.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleJoin = async (e) => {
    e.preventDefault()
    if (!inviteToken.trim()) return
    
    setError('')
    setLoading(true)
    
    try {
      await acceptInvite(inviteToken.trim())
      window.history.replaceState({}, '', window.location.pathname)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const renderChoice = () => (
    <div style={pageStyles.choiceContainer}>
      <button
        onClick={() => setMode('create')}
        style={pageStyles.choiceButton}
      >
        <span style={pageStyles.choiceIcon}>🏠</span>
        <span style={pageStyles.choiceTitle}>{t('createHousehold')}</span>
        <span style={pageStyles.choiceDesc}>
          Créer un nouveau foyer et inviter des membres
        </span>
      </button>
      
      <div style={pageStyles.divider}>
        <span>ou</span>
      </div>
      
      <button
        onClick={() => setMode('join')}
        style={pageStyles.choiceButton}
      >
        <span style={pageStyles.choiceIcon}>✉️</span>
        <span style={pageStyles.choiceTitle}>{t('joinHousehold')}</span>
        <span style={pageStyles.choiceDesc}>
          Rejoindre un foyer existant avec un code d'invitation
        </span>
      </button>
    </div>
  )
  
  const renderCreate = () => (
    <form onSubmit={handleCreate} style={pageStyles.form}>
      <button
        type="button"
        onClick={() => setMode('choice')}
        style={pageStyles.backButton}
      >
        ← Retour
      </button>
      
      <h2 style={pageStyles.formTitle}>{t('createHousehold')}</h2>
      
      <div style={pageStyles.field}>
        <label style={pageStyles.label}>{t('householdName')}</label>
        <input
          type="text"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          placeholder="Famille Dupont"
          required
          style={pageStyles.input}
          autoFocus
        />
      </div>
      
      <button
        type="submit"
        disabled={loading || !householdName.trim()}
        style={{
          ...pageStyles.submitButton,
          opacity: loading || !householdName.trim() ? 0.7 : 1,
        }}
      >
        {loading ? t('loading') : 'Créer le foyer'}
      </button>
    </form>
  )
  
  const renderJoin = () => (
    <form onSubmit={handleJoin} style={pageStyles.form}>
      <button
        type="button"
        onClick={() => setMode('choice')}
        style={pageStyles.backButton}
      >
        ← Retour
      </button>
      
      <h2 style={pageStyles.formTitle}>{t('joinHousehold')}</h2>
      
      <div style={pageStyles.field}>
        <label style={pageStyles.label}>Code d'invitation</label>
        <input
          type="text"
          value={inviteToken}
          onChange={(e) => setInviteToken(e.target.value)}
          placeholder="Collez votre code d'invitation"
          required
          style={pageStyles.input}
          autoFocus
        />
        <p style={pageStyles.hint}>
          Ce code vous a été envoyé par email par un membre du foyer
        </p>
      </div>
      
      <button
        type="submit"
        disabled={loading || !inviteToken.trim()}
        style={{
          ...pageStyles.submitButton,
          opacity: loading || !inviteToken.trim() ? 0.7 : 1,
        }}
      >
        {loading ? t('loading') : 'Rejoindre le foyer'}
      </button>
    </form>
  )
  
  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.card}>
        <div style={pageStyles.header}>
          <span style={pageStyles.emoji}>🍳</span>
          <h1 style={pageStyles.title}>Mes Recettes</h1>
          <p style={pageStyles.subtitle}>
            Configurez votre foyer pour commencer
          </p>
        </div>
        
        {error && (
          <div style={pageStyles.error}>
            {error}
          </div>
        )}
        
        {mode === 'choice' && renderChoice()}
        {mode === 'create' && renderCreate()}
        {mode === 'join' && renderJoin()}
        
        <button
          onClick={signOut}
          style={pageStyles.logoutButton}
        >
          {t('logout')}
        </button>
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
    maxWidth: '420px',
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
  choiceContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  choiceButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '24px 20px',
    backgroundColor: theme.colors.backgroundAlt,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    transition: theme.transitions.fast,
    textAlign: 'center',
  },
  choiceIcon: {
    fontSize: '32px',
  },
  choiceTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.text,
  },
  choiceDesc: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    lineHeight: 1.4,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    color: theme.colors.textMuted,
    fontSize: '13px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  backButton: {
    alignSelf: 'flex-start',
    background: 'none',
    border: 'none',
    color: theme.colors.textSecondary,
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 0',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: '0 0 8px 0',
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
  hint: {
    fontSize: '12px',
    color: theme.colors.textMuted,
    margin: '4px 0 0 0',
  },
  submitButton: {
    ...styles.buttonPrimary,
    width: '100%',
    padding: '14px',
    marginTop: '8px',
    fontSize: '16px',
  },
  logoutButton: {
    width: '100%',
    padding: '12px',
    marginTop: '24px',
    background: 'none',
    border: 'none',
    color: theme.colors.textSecondary,
    fontSize: '14px',
    cursor: 'pointer',
  },
}