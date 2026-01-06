import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, commonStyles } from '../lib/theme'
import ShoppingListGenerator from './ShoppingListGenerator'

export default function ShoppingListPage() {
  const { 
    t, getName, language,
    ingredients, shoppingItems,
    createShoppingItem, updateShoppingItem, deleteShoppingItem,
    deleteCheckedShoppingItems, deleteAllShoppingItems
  } = useApp()

  const [showGenerator, setShowGenerator] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customItem, setCustomItem] = useState('')
  const [notification, setNotification] = useState(null)

  // Separate checked and unchecked items
  const uncheckedItems = shoppingItems.filter(item => !item.checked)
  const checkedItems = shoppingItems.filter(item => item.checked)

  // Filter available ingredients
  const filteredIngredients = ingredients.filter(ing =>
    ing.name_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle item checked
  const handleToggleItem = async (item) => {
    try {
      await updateShoppingItem(item.id, { checked: !item.checked })
    } catch (error) {
      console.error('Toggle item error:', error)
    }
  }

  // Delete item
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteShoppingItem(itemId)
    } catch (error) {
      console.error('Delete item error:', error)
    }
  }

  // Add ingredient from list
  const handleAddIngredient = async (ingredient) => {
    try {
      await createShoppingItem({
        ingredient_id: ingredient.id,
        quantity: '',
        unit: ''
      })
      setSearchQuery('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Add ingredient error:', error)
    }
  }

  // Add custom item
  const handleAddCustomItem = async () => {
    if (!customItem.trim()) return
    try {
      await createShoppingItem({
        custom_name: customItem.trim(),
        quantity: '',
        unit: ''
      })
      setCustomItem('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Add custom item error:', error)
    }
  }

  // Clear checked items
  const handleClearChecked = async () => {
    if (checkedItems.length === 0) return
    try {
      await deleteCheckedShoppingItems()
    } catch (error) {
      console.error('Clear checked error:', error)
    }
  }

  // Clear all items
  const handleClearAll = async () => {
    if (shoppingItems.length === 0) return
    if (!window.confirm(t('shopping.clearAllConfirm'))) return
    try {
      await deleteAllShoppingItems()
    } catch (error) {
      console.error('Clear all error:', error)
    }
  }

  // Handle generated notification
  const handleGenerated = (count) => {
    setNotification(t('shopping.itemsAdded', { count }))
    setTimeout(() => setNotification(null), 3000)
  }

  // Get item display name
  const getItemName = (item) => {
    if (item.custom_name) return item.custom_name
    if (item.ingredient) return getName(item.ingredient)
    return '?'
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>{t('shopping.title')}</h1>
        <div style={styles.headerActions}>
          <button
            onClick={() => setShowGenerator(true)}
            style={styles.generateButton}
          >
            📅
          </button>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div style={styles.notification}>
          ✓ {notification}
        </div>
      )}

      {/* Actions bar */}
      {shoppingItems.length > 0 && (
        <div style={styles.actionsBar}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={styles.addButton}
          >
            + {t('shopping.addItem')}
          </button>
          <div style={styles.actionsRight}>
            {checkedItems.length > 0 && (
              <button onClick={handleClearChecked} style={styles.clearButton}>
                {t('shopping.clearChecked')}
              </button>
            )}
            <button onClick={handleClearAll} style={styles.clearAllButton}>
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div style={styles.addForm}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('recipe.ingredients.select')}
            style={styles.searchInput}
            autoFocus
          />
          
          {searchQuery && (
            <div style={styles.suggestions}>
              {filteredIngredients.slice(0, 5).map(ing => (
                <button
                  key={ing.id}
                  onClick={() => handleAddIngredient(ing)}
                  style={styles.suggestionItem}
                >
                  {getName(ing)}
                </button>
              ))}
              <button
                onClick={() => {
                  setCustomItem(searchQuery)
                  setSearchQuery('')
                }}
                style={styles.customItemButton}
              >
                + "{searchQuery}" ({t('shopping.customItem').replace('...', '')})
              </button>
            </div>
          )}

          {customItem && (
            <div style={styles.customForm}>
              <input
                type="text"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                style={styles.customInput}
                autoFocus
              />
              <button onClick={handleAddCustomItem} style={styles.customAddButton}>
                +
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {shoppingItems.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>🛒</p>
          <p style={styles.emptyText}>{t('shopping.empty')}</p>
          <button
            onClick={() => setShowGenerator(true)}
            style={styles.emptyButton}
          >
            📅 {t('shopping.generate')}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            style={styles.emptyButtonSecondary}
          >
            + {t('shopping.addItem')}
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {/* Unchecked items */}
          {uncheckedItems.map(item => (
            <div key={item.id} style={styles.item}>
              <button
                onClick={() => handleToggleItem(item)}
                style={styles.itemCheckbox}
              >
                <div style={styles.checkboxEmpty} />
              </button>
              <div style={styles.itemContent}>
                <span style={styles.itemName}>{getItemName(item)}</span>
                {(item.quantity || item.unit) && (
                  <span style={styles.itemQuantity}>
                    {item.quantity} {item.unit}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteItem(item.id)}
                style={styles.itemDelete}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Checked items */}
          {checkedItems.length > 0 && (
            <>
              <div style={styles.separator}>
                <span style={styles.separatorText}>
                  ✓ {checkedItems.length}
                </span>
              </div>
              {checkedItems.map(item => (
                <div key={item.id} style={styles.itemChecked}>
                  <button
                    onClick={() => handleToggleItem(item)}
                    style={styles.itemCheckbox}
                  >
                    <div style={styles.checkboxChecked}>✓</div>
                  </button>
                  <div style={styles.itemContent}>
                    <span style={styles.itemNameChecked}>{getItemName(item)}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    style={styles.itemDelete}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Generator modal */}
      {showGenerator && (
        <ShoppingListGenerator
          onClose={() => setShowGenerator(false)}
          onGenerated={handleGenerated}
        />
      )}
    </div>
  )
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },

  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['2xl'],
    color: colors.forest,
    margin: 0
  },

  headerActions: {
    display: 'flex',
    gap: spacing.sm
  },

  generateButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${colors.warmGray}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    fontSize: fontSizes.lg,
    cursor: 'pointer'
  },

  notification: {
    backgroundColor: colors.successLight,
    color: colors.success,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontSize: fontSizes.sm,
    fontWeight: 600
  },

  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },

  addButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary,
    padding: `${spacing.xs} ${spacing.md}`,
    fontSize: fontSizes.sm
  },

  actionsRight: {
    display: 'flex',
    gap: spacing.sm
  },

  clearButton: {
    ...commonStyles.buttonBase,
    backgroundColor: 'transparent',
    color: colors.textMuted,
    border: `1px solid ${colors.warmGray}`,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: fontSizes.xs
  },

  clearAllButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${colors.warmGray}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    cursor: 'pointer',
    fontSize: fontSizes.sm
  },

  addForm: {
    marginBottom: spacing.md
  },

  searchInput: {
    ...commonStyles.input,
    padding: spacing.sm,
    marginBottom: spacing.xs
  },

  suggestions: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.warmGray}`,
    borderRadius: borderRadius.md,
    overflow: 'hidden'
  },

  suggestionItem: {
    width: '100%',
    padding: spacing.sm,
    textAlign: 'left',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    borderBottom: `1px solid ${colors.warmGray}`
  },

  customItemButton: {
    width: '100%',
    padding: spacing.sm,
    textAlign: 'left',
    border: 'none',
    backgroundColor: colors.forest + '10',
    cursor: 'pointer',
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.forest,
    fontWeight: 600
  },

  customForm: {
    display: 'flex',
    gap: spacing.sm,
    marginTop: spacing.sm
  },

  customInput: {
    ...commonStyles.input,
    flex: 1,
    padding: spacing.sm
  },

  customAddButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary,
    width: '44px',
    padding: spacing.sm
  },

  empty: {
    textAlign: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl
  },

  emptyIcon: {
    fontSize: '48px',
    marginBottom: spacing.md
  },

  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg
  },

  emptyButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary,
    marginBottom: spacing.sm
  },

  emptyButtonSecondary: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonSecondary
  },

  list: {
    display: 'flex',
    flexDirection: 'column'
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.warmGray}`
  },

  itemChecked: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.cream,
    borderBottom: `1px solid ${colors.warmGray}`
  },

  itemCheckbox: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0
  },

  checkboxEmpty: {
    width: '24px',
    height: '24px',
    borderRadius: borderRadius.md,
    border: `2px solid ${colors.warmGrayDark}`
  },

  checkboxChecked: {
    width: '24px',
    height: '24px',
    borderRadius: borderRadius.md,
    backgroundColor: colors.forest,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSizes.sm,
    fontWeight: 700
  },

  itemContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },

  itemName: {
    fontSize: fontSizes.md,
    color: colors.textPrimary
  },

  itemNameChecked: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textDecoration: 'line-through'
  },

  itemQuantity: {
    fontSize: fontSizes.sm,
    color: colors.textMuted
  },

  itemDelete: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.textMuted,
    cursor: 'pointer',
    fontSize: fontSizes.sm
  },

  separator: {
    padding: spacing.sm,
    backgroundColor: colors.warmGray,
    textAlign: 'center'
  },

  separatorText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: 600
  }
}