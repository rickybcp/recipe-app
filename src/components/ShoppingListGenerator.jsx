import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, commonStyles } from '../lib/theme'

export default function ShoppingListGenerator({ onClose, onGenerated }) {
  const { t, getName, language, mealPlans, loadMealPlans, createShoppingItems, recipes } = useApp()
  
  const [selectedDates, setSelectedDates] = useState([])
  const [generating, setGenerating] = useState(false)

  const locale = language === 'fr' ? fr : enUS

  // Get current week days
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Load meal plans for the week
  useEffect(() => {
    const startStr = format(weekStart, 'yyyy-MM-dd')
    const endStr = format(weekEnd, 'yyyy-MM-dd')
    loadMealPlans(startStr, endStr)
  }, [])

  // Get meals for a specific day
  const getMealsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return mealPlans.filter(mp => mp.planned_date === dayStr)
  }

  // Toggle day selection
  const toggleDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    setSelectedDates(prev => 
      prev.includes(dayStr)
        ? prev.filter(d => d !== dayStr)
        : [...prev, dayStr]
    )
  }

  // Count selected meals
  const selectedMealsCount = selectedDates.reduce((count, dateStr) => {
    return count + mealPlans.filter(mp => mp.planned_date === dateStr).length
  }, 0)

  // Generate shopping list
  const handleGenerate = async () => {
    setGenerating(true)
    try {
      // Get all recipes for selected dates
      const selectedMealPlans = mealPlans.filter(mp => 
        selectedDates.includes(mp.planned_date)
      )

      // Collect all ingredients with quantities
      const ingredientMap = new Map()

      for (const mealPlan of selectedMealPlans) {
        // Find the full recipe with ingredients
        const recipe = recipes.find(r => r.id === mealPlan.recipe_id)
        if (!recipe?.recipe_ingredients) continue

        for (const ri of recipe.recipe_ingredients) {
          const key = ri.ingredient_id
          
          if (ingredientMap.has(key)) {
            // Ingredient already exists, we could merge quantities but for now just keep first
            const existing = ingredientMap.get(key)
            // Optionally combine quantities here
          } else {
            ingredientMap.set(key, {
              ingredient_id: ri.ingredient_id,
              quantity: ri.quantity || '',
              unit: ri.unit || ''
            })
          }
        }
      }

      // Create shopping items
      const items = Array.from(ingredientMap.values())
      
      if (items.length > 0) {
        await createShoppingItems(items)
      }

      onGenerated(items.length)
      onClose()
    } catch (error) {
      console.error('Generate shopping list error:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>{t('shopping.selectDays')}</h2>
            <p style={styles.subtitle}>{t('shopping.selectDaysDesc')}</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Days list */}
        <div style={styles.content}>
          {days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd')
            const meals = getMealsForDay(day)
            const isSelected = selectedDates.includes(dayStr)
            const isToday = isSameDay(day, today)

            return (
              <button
                key={dayStr}
                onClick={() => toggleDay(day)}
                style={{
                  ...styles.dayItem,
                  backgroundColor: isSelected ? colors.forest + '15' : colors.white,
                  borderColor: isSelected ? colors.forest : colors.warmGray
                }}
              >
                <div style={styles.dayHeader}>
                  <div style={styles.dayInfo}>
                    <span style={{
                      ...styles.dayName,
                      color: isToday ? colors.forest : colors.textPrimary
                    }}>
                      {format(day, 'EEEE', { locale })}
                    </span>
                    <span style={styles.dayDate}>
                      {format(day, 'd MMMM', { locale })}
                    </span>
                  </div>
                  <div style={{
                    ...styles.checkbox,
                    backgroundColor: isSelected ? colors.forest : colors.white,
                    borderColor: isSelected ? colors.forest : colors.warmGrayDark
                  }}>
                    {isSelected && <span style={styles.checkmark}>✓</span>}
                  </div>
                </div>
                
                {meals.length > 0 ? (
                  <div style={styles.mealsList}>
                    {meals.map(meal => (
                      <span key={meal.id} style={styles.mealChip}>
                        {meal.recipe?.name || '?'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={styles.noMeals}>—</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.selectedCount}>
            {selectedMealsCount} {t('shopping.selectedMeals')}
          </span>
          <button
            onClick={handleGenerate}
            disabled={generating || selectedMealsCount === 0}
            style={{
              ...styles.generateButton,
              opacity: (generating || selectedMealsCount === 0) ? 0.6 : 1
            }}
          >
            {generating ? t('common.loading') : t('shopping.generateList')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// STYLES
// ============================================

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    zIndex: 1000
  },

  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: '450px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: shadows.lg
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottom: `1px solid ${colors.warmGray}`
  },

  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.xl,
    color: colors.forest,
    margin: 0
  },

  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    margin: 0,
    marginTop: '4px'
  },

  closeButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: colors.warmGray,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    fontSize: fontSizes.md,
    color: colors.textSecondary
  },

  content: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm
  },

  dayItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    padding: spacing.md,
    border: '2px solid',
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    fontFamily: fonts.body,
    textAlign: 'left',
    transition: 'all 0.2s ease'
  },

  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  dayInfo: {
    display: 'flex',
    flexDirection: 'column'
  },

  dayName: {
    fontSize: fontSizes.md,
    fontWeight: 600,
    textTransform: 'capitalize'
  },

  dayDate: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textTransform: 'capitalize'
  },

  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: borderRadius.md,
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  checkmark: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: 700
  },

  mealsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs
  },

  mealChip: {
    fontSize: fontSizes.xs,
    backgroundColor: colors.warmGray,
    padding: `2px ${spacing.sm}`,
    borderRadius: borderRadius.full,
    color: colors.textSecondary
  },

  noMeals: {
    fontSize: fontSizes.sm,
    color: colors.textMuted
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderTop: `1px solid ${colors.warmGray}`
  },

  selectedCount: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary
  },

  generateButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary
  }
}