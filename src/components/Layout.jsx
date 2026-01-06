import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing } from '../lib/theme'
import RecipesPage from './RecipesPage'
import CalendarPage from './CalendarPage'
import ShoppingListPage from './ShoppingListPage'
import SettingsPage from './SettingsPage'

export default function Layout() {
  const { t, currentTab, setCurrentTab, shoppingItems } = useApp()

  // Count unchecked shopping items for badge
  const uncheckedCount = shoppingItems.filter(item => !item.checked).length

  const renderPage = () => {
    switch (currentTab) {
      case 'recipes':
        return <RecipesPage />
      case 'calendar':
        return <CalendarPage />
      case 'shopping':
        return <ShoppingListPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <RecipesPage />
    }
  }

  const tabs = [
    { id: 'recipes', label: t('nav.recipes'), icon: '🍳' },
    { id: 'calendar', label: t('nav.calendar'), icon: '📅' },
    { id: 'shopping', label: t('nav.shopping'), icon: '🛒', badge: uncheckedCount },
    { id: 'settings', label: t('nav.settings'), icon: '⚙️' }
  ]

  return (
    <div style={styles.container}>
      {/* Main content */}
      <main style={styles.main}>
        {renderPage()}
      </main>

      {/* Bottom navigation */}
      <nav style={styles.nav}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            style={{
              ...styles.navButton,
              color: currentTab === tab.id ? colors.forest : colors.textMuted
            }}
          >
            <span style={styles.navIcon}>
              {tab.icon}
              {tab.badge > 0 && (
                <span style={styles.navBadge}>{tab.badge > 9 ? '9+' : tab.badge}</span>
              )}
            </span>
            <span style={{
              ...styles.navLabel,
              fontWeight: currentTab === tab.id ? 600 : 400
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
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
    paddingBottom: 'env(safe-area-inset-bottom)',
    zIndex: 100
  },

  navButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: spacing.sm,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontFamily: fonts.body
  },

  navIcon: {
    fontSize: '20px',
    position: 'relative'
  },

  navBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-10px',
    backgroundColor: colors.terracotta,
    color: colors.white,
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: '10px',
    minWidth: '16px',
    textAlign: 'center'
  },

  navLabel: {
    fontSize: fontSizes.xs
  }
}