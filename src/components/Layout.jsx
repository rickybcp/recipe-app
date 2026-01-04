import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, shadows } from '../lib/theme'
import RecipesPage from './RecipesPage'
import CalendarPage from './CalendarPage'
import SettingsPage from './SettingsPage'

export default function Layout() {
  const { currentTab, setCurrentTab, t } = useApp()

  const renderPage = () => {
    switch (currentTab) {
      case 'recipes':
        return <RecipesPage />
      case 'calendar':
        return <CalendarPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <RecipesPage />
    }
  }

  return (
    <div style={styles.container}>
      {/* Main content */}
      <main style={styles.main}>
        {renderPage()}
      </main>

      {/* Bottom navigation */}
      <nav style={styles.nav}>
        <NavButton
          icon="🍳"
          label={t('nav.recipes')}
          isActive={currentTab === 'recipes'}
          onClick={() => setCurrentTab('recipes')}
        />
        <NavButton
          icon="📅"
          label={t('nav.calendar')}
          isActive={currentTab === 'calendar'}
          onClick={() => setCurrentTab('calendar')}
        />
        <NavButton
          icon="⚙️"
          label={t('nav.settings')}
          isActive={currentTab === 'settings'}
          onClick={() => setCurrentTab('settings')}
        />
      </nav>
    </div>
  )
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navButton,
        color: isActive ? colors.forest : colors.textMuted,
        backgroundColor: isActive ? colors.successLight : 'transparent'
      }}
    >
      <span style={styles.navIcon}>{icon}</span>
      <span style={{
        ...styles.navLabel,
        fontWeight: isActive ? 700 : 400
      }}>
        {label}
      </span>
    </button>
  )
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.cream
  },

  main: {
    flex: 1,
    paddingBottom: '80px', // Space for nav
    overflowY: 'auto'
  },

  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70px',
    backgroundColor: colors.white,
    borderTop: `1px solid ${colors.warmGray}`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: `0 ${spacing.md}`,
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxShadow: shadows.lg
  },

  navButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: `${spacing.sm} ${spacing.md}`,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: fonts.body,
    minWidth: '70px'
  },

  navIcon: {
    fontSize: '24px',
    lineHeight: 1
  },

  navLabel: {
    fontSize: fontSizes.xs,
    lineHeight: 1
  }
}