import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, commonStyles } from '../lib/theme'
import ShoppingListGenerator from './ShoppingListGenerator'

// Helper: Parse quantity to number
function parseQuantity(str) {
  if (!str || str.trim() === '') return null
  const cleaned = str.trim().replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

// Helper: Add quantity
function addToQuantity(currentQty, currentUnit, addQty) {
  const currentNum = parseQuantity(currentQty)
  const addNum = parseQuantity(addQty)
  
  // Both numeric - just add
  if (currentNum !== null && addNum !== null) {
    const total = currentNum + addNum
    const formatted = total % 1 === 0 ? total.toString() : total.toFixed(1)
    return { quantity: formatted, unit: currentUnit }
  }
  
  // Current is numeric, add is a number
  if (currentNum !== null) {
    const total = currentNum + (addNum || 1)
    const formatted = total % 1 === 0 ? total.toString() : total.toFixed(1)
    return { quantity: formatted, unit: currentUnit }
  }
  
  // Current exists but not numeric - append
  if (currentQty) {
    const addPart = addQty || '1'
    return { quantity: `${currentQty} + ${addPart}`, unit: null }
  }
  
  // No current quantity - use add value or 1
  return { quantity: addQty || '1', unit: currentUnit }
}

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

  // Get existing ingredient IDs (for showing "already in list" indicator)
  const existingIngredientIds = new Set(
    shoppingItems
      .filter(item => item.ingredient_id && !item.checked)
      .map(item => item.ingredient_id)
  )

  // Filter ingredients by search query (don't exclude existing ones)
  const filteredIngredients = ingredients
    .filter(ing =>
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

  // Add ingredient from list (or increment if exists)
  const handleAddIngredient = async (ingredient) => {
    try {
      // Check if ingredient already exists in unchecked list
      const existingItem = shoppingItems.find(
        item => item.ingredient_id === ingredient.id && !item.checked
      )
      
      if (existingItem) {
        // Increment the quantity by 1
        const updated = addToQuantity(existingItem.quantity, existingItem.unit, '1')
        await updateShoppingItem(existingItem.id, {
          quantity: updated.quantity,
          unit: updated.unit
        })
        setNotification(language === 'fr' 
          ? `${getName(ingredient)} +1`
          : `${getName(ingredient)} +1`)
      } else {
        // Create new item with quantity 1
        await createShoppingItem({
          ingredient_id: ingredient.id,
          quantity: '1',
          unit: null,
          count: 1
        })
      }
      
      setSearchQuery('')
      setShowAddForm(false)
      setTimeout(() => setNotification(null), 2000)
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
        quantity: '1',
        unit: null,
        count: 1
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
      setNotification(language === 'fr' 
        ? `${checkedItems.length} article(s) supprimé(s)`
        : `${checkedItems.length} item(s) removed`)
      setTimeout(() => setNotification(null), 2000)
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

  // Get item display with quantity
  const getItemDetails = (item) => {
    if (!item.quantity) return null
    
    if (item.unit) {
      return `${item.quantity} ${item.unit}`
    }
    return item.quantity
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
            title={t('shopping.generate')}
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
      <div style={styles.actionsBar}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={styles.addButton}
        >
          + {t('shopping.addItem')}
        </button>
        <div style={styles.actionsRight}>
          {checkedItems.length > 0 && (
            <button onClick={handleClearChecked} style={styles.clearCheckedButton}>
              🗑️ {t('shopping.clearChecked')} ({checkedItems.length})
            </button>
          )}
          {shoppingItems.length > 0 && (
            <button onClick={handleClearAll} style={styles.clearAllButton}>
              {t('shopping.clearAll')}
            </button>
          )}
        </div>
      </div>

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
              {filteredIngredients.slice(0, 8).map(ing => {
                const isInList = existingIngredientIds.has(ing.id)
                return (
                  <button
                    key={ing.id}
                    onClick={() => handleAddIngredient(ing)}
                    style={{
                      ...styles.suggestionItem,
                      backgroundColor: isInList ? colors.forest + '08' : 'transparent'
                    }}
                  >
                    <span>{getName(ing)}</span>
                    {isInList && (
                      <span style={styles.inListBadge}>
                        {language === 'fr' ? '+1' : '+1'}
                      </span>
                    )}
                  </button>
                )
              })}
              <button
                onClick={() => {
                  setCustomItem(searchQuery)
                  setSearchQuery('')
                }}
                style={styles.customItemButton}
              >
                + "{searchQuery}" ({language === 'fr' ? 'article personnalisé' : 'custom item'})
              </button>
            </div>
          )}

          {customItem && (
            <div style={styles.customForm}>
              <input
                type="text"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                placeholder={t('shopping.customItem')}
                style={styles.customInput}
                autoFocus
              />
              <button onClick={handleAddCustomItem} style={styles.customAddButton}>
                +
              </button>
              <button 
                onClick={() => setCustomItem('')} 
                style={styles.customCancelButton}
              >
                ✕
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
          {/* Stats */}
          <div style={styles.stats}>
            <span style={styles.statsText}>
              {uncheckedItems.length} {language === 'fr' ? 'restant(s)' : 'remaining'} • {checkedItems.length} {language === 'fr' ? 'coché(s)' : 'checked'}
            </span>
          </div>

          {/* Unchecked items */}
          {uncheckedItems.map(item => {
            const details = getItemDetails(item)
            return (
              <div key={item.id} style={styles.item}>
                <button
                  onClick={() => handleToggleItem(item)}
                  style={styles.itemCheckbox}
                >
                  <div style={styles.checkboxEmpty} />
                </button>
                <div style={styles.itemContent}>
                  <span style={styles.itemName}>{getItemName(item)}</span>
                  {details && (
                    <span style={styles.itemQuantity}>{details}</span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  style={styles.itemDelete}
                >
                  ✕
                </button>
              </div>
            )
          })}

          {/* Checked items */}
          {checkedItems.length > 0 && (
            <>
              <div style={styles.separator}>
                <span style={styles.separatorText}>
                  ✓ {language === 'fr' ? 'Dans le caddie' : 'In cart'} ({checkedItems.length})
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
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.forest}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    fontSize: fontSizes.xl,
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
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md
  },

  addButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSizes.sm
  },

  actionsRight: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap'
  },

  clearCheckedButton: {
    ...commonStyles.buttonBase,
    backgroundColor: colors.terracotta + '15',
    color: colors.terracotta,
    border: `1px solid ${colors.terracotta}`,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: fontSizes.xs
  },

  clearAllButton: {
    ...commonStyles.buttonBase,
    backgroundColor: 'transparent',
    color: colors.textMuted,
    border: `1px solid ${colors.warmGray}`,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: fontSizes.xs
  },

  addForm: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm
  },

  searchInput: {
    ...commonStyles.input,
    padding: spacing.sm,
    marginBottom: spacing.xs
  },

  suggestions: {
    backgroundColor: colors.cream,
    borderRadius: borderRadius.md,
    overflow: 'hidden'
  },

  suggestionItem: {
    width: '100%',
    padding: spacing.sm,
    textAlign: 'left',
    border: 'none',
    cursor: 'pointer',
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    borderBottom: `1px solid ${colors.warmGray}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  inListBadge: {
    backgroundColor: colors.forest,
    color: colors.white,
    padding: `2px ${spacing.xs}`,
    borderRadius: borderRadius.full,
    fontSize: fontSizes.xs,
    fontWeight: 600
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

  customCancelButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonSecondary,
    width: '44px',
    padding: spacing.sm
  },

  empty: {
    textAlign: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl
  },

  emptyIcon: {
    fontSize: '64px',
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
    flexDirection: 'column',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    boxShadow: shadows.sm
  },

  stats: {
    padding: spacing.sm,
    backgroundColor: colors.cream,
    borderBottom: `1px solid ${colors.warmGray}`
  },

  statsText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    display: 'block'
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
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
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0
  },

  checkboxEmpty: {
    width: '26px',
    height: '26px',
    borderRadius: borderRadius.md,
    border: `2px solid ${colors.warmGrayDark}`
  },

  checkboxChecked: {
    width: '26px',
    height: '26px',
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
    color: colors.terracotta,
    fontWeight: 500
  },

  itemDelete: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.textMuted,
    cursor: 'pointer',
    fontSize: fontSizes.sm,
    borderRadius: borderRadius.full
  },

  separator: {
    padding: spacing.sm,
    backgroundColor: colors.forest + '10',
    borderBottom: `1px solid ${colors.warmGray}`
  },

  separatorText: {
    fontSize: fontSizes.sm,
    color: colors.forest,
    fontWeight: 600,
    textAlign: 'center',
    display: 'block'
  }
}