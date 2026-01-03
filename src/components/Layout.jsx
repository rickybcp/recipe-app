import React from 'react'
import { useApp } from '../contexts/AppContext'
import { theme } from '../lib/theme'

export default function Layout({ children }) {
  const { t, currentPage, setPage, household } = useApp()
  
  const navItems = [
    { id: 'recipes', icon: '📖', label: t('recipes') },
    { id: 'calendar', icon: '📅', label: t('calendar') },
    { id: 'settings', icon: '⚙️', label: t('settings') },
  ]
  
  return (
    <div style={layoutStyles.container}>
      <header style={layoutStyles.header}>
        <div style={layoutStyles.headerContent}>
          <span style={layoutStyles.logo}>🍳</span>
          <div>
            <h1 style={layoutStyles.title}>{household?.name || 'Mes Recettes'}</h1>
          </div>
        </div>
      </header>
      
      <main style={layoutStyles.main}>
        {children}
      </main>
      
      <nav style={layoutStyles.nav}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              ...layoutStyles.navItem,
              ...(currentPage === item.id ? layoutStyles.navItemActive : {}),
            }}
          >
            <span style={layoutStyles.navIcon}>{item.icon}</span>
            <span style={{
              ...layoutStyles.navLabel,
              ...(currentPage === item.id ? layoutStyles.navLabelActive : {}),
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}

const layoutStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    maxHeight: '100vh',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: '12px 16px',
    paddingTop: 'max(12px, env(safe-area-inset-top))',
    boxShadow: theme.shadows.md,
    position: 'relative',
    zIndex: 10,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '28px',
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: '20px',
    color: theme.colors.textInverse,
    margin: 0,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderTop: `1px solid ${theme.colors.border}`,
    padding: '8px 0',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    position: 'relative',
    zIndex: 10,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 20px',
    background: 'none',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: theme.transitions.fast,
  },
  navItemActive: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  navIcon: {
    fontSize: '22px',
  },
  navLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
}