import React, { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { theme, styles } from '../lib/theme'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

export default function MealPicker({ date, onClose }) {
  const { t, language, recipes, mealPlans, addMealPlan } = useApp()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  
  const locale = language === 'fr' ? fr : enUS
  const dateStr = format(date, 'yyyy-MM-dd')
  
  const existingMeals = mealPlans.filter(mp => mp.planned_date === dateStr)
  const existingRecipeIds = existingMeals.map(m => m.recipe_id)
  
  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes
    const query = search.toLowerCase()
    return recipes.filter(r => 
      r.name.toLowerCase().includes(query)
    )
  }, [recipes, search])
  
  const handleSelectRecipe = async (recipe) => {
    setLoading(true)
    try {
      await addMealPlan(recipe.id, dateStr, 'dinner')
      onClose()
    } catch (error) {
      console.error('Error adding meal:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getName = (item) => {
    if (!item) return ''
    return language === 'fr' ? (item.name_fr || item.name) : (item.name_en || item.name)
  }
  
  return (
    <div style={pickerStyles.overlay} onClick={onClose}>
      <div style={pickerStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={pickerStyles.header}>
          <div>
            <h2 style={pickerStyles.title}>{t('addMeal')}</h2>
            <p style={pickerStyles.date}>
              {format(date, 'EEEE d MMMM', { locale })}
            </p>
          </div>
          <button onClick={onClose} style={pickerStyles.closeButton}>✕</button>
        </div>
        
        <div style={pickerStyles.searchContainer}>
          <span style={pickerStyles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={pickerStyles.searchInput}
            autoFocus
          />
        </div>
        
        <div style={pickerStyles.recipeList}>
          {filteredRecipes.length === 0 ? (
            <div style={pickerStyles.emptyState}>
              <p>{t('noRecipes')}</p>
            </div>
          ) : (
            filteredRecipes.map(recipe => {
              const isAlreadyPlanned = existingRecipeIds.includes(recipe.id)
              const tagIcons = recipe.tags?.map(t => t.icon).filter(Boolean).join(' ') || ''
              
              return (
                <button
                  key={recipe.id}
                  onClick={() => !isAlreadyPlanned && handleSelectRecipe(recipe)}
                  disabled={loading || isAlreadyPlanned}
                  style={{
                    ...pickerStyles.recipeItem,
                    opacity: isAlreadyPlanned ? 0.5 : 1,
                    cursor: isAlreadyPlanned ? 'default' : 'pointer',
                  }}
                >
                  <div style={pickerStyles.recipeInfo}>
                    <span style={pickerStyles.recipeName}>{recipe.name}</span>
                    <div style={pickerStyles.recipeMeta}>
                      {recipe.cuisine?.flag && (
                        <span>{recipe.cuisine.flag}</span>
                      )}
                      {tagIcons && <span>{tagIcons}</span>}
                      {recipe.prep_time_minutes && (
                        <span style={pickerStyles.time}>
                          ⏱️ {recipe.prep_time_minutes} {t('minutes')}
                        </span>
                      )}
                    </div>
                  </div>
                  {recipe.base && (
                    <span style={pickerStyles.base}>{getName(recipe.base)}</span>
                  )}
                  {isAlreadyPlanned ? (
                    <span style={pickerStyles.checkmark}>✓</span>
                  ) : (
                    <span style={pickerStyles.addIcon}>+</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const pickerStyles = {
  overlay: {
    ...styles.modalOverlay,
    alignItems: 'flex-end',
  },
  modal: {
    ...styles.modalContent,
    maxHeight: '80vh',
    borderRadius: `${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0`,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: '0 0 4px 0',
  },
  date: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
    textTransform: 'capitalize',
  },
  closeButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: theme.colors.backgroundAlt,
    border: 'none',
    fontSize: '16px',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '16px',
    padding: '12px 16px',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.full,
  },
  searchIcon: {
    fontSize: '16px',
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'none',
    fontSize: '15px',
    color: theme.colors.text,
    outline: 'none',
  },
  recipeList: {
    flex: 1,
    overflow: 'auto',
    padding: '0 16px 16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px',
    color: theme.colors.textSecondary,
  },
  recipeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 16px',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    marginBottom: '8px',
    textAlign: 'left',
    transition: theme.transitions.fast,
  },
  recipeInfo: {
    flex: 1,
    minWidth: 0,
  },
  recipeName: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  recipeMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  time: {
    color: theme.colors.textSecondary,
  },
  base: {
    padding: '4px 10px',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.full,
    fontSize: '12px',
    color: theme.colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  addIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    color: '#fff',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkmark: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: theme.colors.success,
    color: '#fff',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
}