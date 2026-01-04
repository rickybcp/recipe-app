import { useApp } from './contexts/AppContext'
import AuthPage from './components/AuthPage'
import Layout from './components/Layout'
import { colors } from './lib/theme'

export default function App() {
  const { user, authLoading, dataLoading } = useApp()

  // Show nothing while checking auth (prevents flash)
  if (authLoading) {
    return null
  }

  // Not authenticated
  if (!user) {
    return <AuthPage />
  }

  // Authenticated but loading data
  if (dataLoading) {
    return <LoadingScreen />
  }

  // Ready
  return <Layout />
}

function LoadingScreen() {
  const { t } = useApp()
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cream
    }}>
      <div style={{
        textAlign: 'center',
        color: colors.textSecondary
      }}>
        <div style={{
          width: 40,
          height: 40,
          margin: '0 auto 16px',
          border: `3px solid ${colors.warmGray}`,
          borderTopColor: colors.forest,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        {t('common.loading')}
      </div>
    </div>
  )
}
