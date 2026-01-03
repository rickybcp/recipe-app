import React from 'react'
import { useApp } from './contexts/AppContext'
import { theme } from './lib/theme'
import AuthPage from './components/AuthPage'
import HouseholdSetup from './components/HouseholdSetup'
import Layout from './components/Layout'
import RecipesPage from './components/RecipesPage'
import CalendarPage from './components/CalendarPage'
import SettingsPage from './components/SettingsPage'

export default function App() {
  const { loading, user, household, currentPage } = useApp()
  
  if (loading) {
    return (
      <div style={loadingStyles.container}>
        <div style={loadingStyles.spinner} />
        <p style={loadingStyles.text}>Chargement...</p>
      </div>
    )
  }
  
  if (!user) {
    return <AuthPage />
  }
  
  if (!household) {
    return <HouseholdSetup />
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'calendar':
        return <CalendarPage />
      case 'settings':
        return <SettingsPage />
      case 'recipes':
      default:
        return <RecipesPage />
    }
  }
  
  return (
    <Layout>
      {renderPage()}
    </Layout>
  )
}

const loadingStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${theme.colors.borderLight}`,
    borderTopColor: theme.colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: '15px',
  }
}

const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)