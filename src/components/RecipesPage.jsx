import React, { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { theme } from '../lib/theme'
import FilterPanel from './FilterPanel'
import RecipeCard from './RecipeCard'
import RecipeForm from './RecipeForm'

export default function RecipesPage() {
  const { t, getFilteredRecipes, filters, setFilters, clearFilters } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  
  const filteredRecipes = useMemo(() => getFilteredRecipes(), [getFilteredRecipes])
  
  const hasActiveFilters = useMemo(() => {
    return filters.search || 
           filters.seasons.length > 0 || 
           filters.bases.length > 0 ||
           filters.cuisines.length > 0 ||
           filters.tags.length > 0 ||
           filters.difficulties.length > 0
  }, [filters])
  
  const handleEdit = (recipe) => {
    setEditingRecipe(recipe)
    setShowForm(true)
  }
  
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRecipe(null)
  }
  
  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.searchContainer}>
        <div style={pageStyles.searchWrapper}>
          <span style={pageStyles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder={t('search')}
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            style={pageStyles.searchInput}
          />
        </div>
      </div>
      
      <FilterPanel />
      
      <div style={pageStyles.resultsBar}>
        <span style={pageStyles.resultsCount}>
          {t('recipeCount', { count: filteredRecipes.length })}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={pageStyles.clearButton}
          >
            {t('clearFilters')}
          </button>
        )}
      </div>
      
      <div style={pageStyles.recipeList}>
        {filteredRecipes.length === 0 ? (
          <div style={pageStyles.emptyState}>
            <span style={pageStyles.emptyIcon}>📭</span>
            <p style={pageStyles.emptyTitle}>
              {hasActiveFilters ? t('noRecipes') : t('noRecipesYet')}
            </p>
            {!hasActiveFilters && (
              <p style={pageStyles.emptySubtitle}>{t('addFirstRecipe')}</p>
            )}
          </div>
        ) : (
          filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={() => handleEdit(recipe)}
            />
          ))
        )}
      </div>
      
      <button
        onClick={() => setShowForm(true)}
        style={pageStyles.fab}
        aria-label={t('addRecipe')}
      >
        <span style={pageStyles.fabIcon}>+</span>
      </button>
      
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

const pageStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
  },
  searchContainer: {
    padding: '12px 16px',
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.full,
    padding: '10px 16px',
    maxWidth: '600px',
    margin: '0 auto',
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
  resultsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: theme.colors.background,
    maxWidth: '632px',
    margin: '0 auto',
    width: '100%',
  },
  resultsCount: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  clearButton: {
    fontSize: '13px',
    color: theme.colors.secondary,
    background: 'none',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  recipeList: {
    flex: 1,
    overflow: 'auto',
    padding: '8px 16px 80px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '632px',
    margin: '0 auto',
    width: '100%',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: '0 0 8px 0',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  fab: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: theme.colors.secondary,
    color: theme.colors.textInverse,
    border: 'none',
    boxShadow: theme.shadows.lg,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: theme.transitions.fast,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: '28px',
    fontWeight: '300',
    lineHeight: 1,
  },
}