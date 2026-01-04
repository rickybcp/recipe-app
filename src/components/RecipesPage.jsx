import { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, borderRadius, commonStyles } from '../lib/theme'
import RecipeCard from './RecipeCard'
import RecipeForm from './RecipeForm'
import FilterPanel from './FilterPanel'

const EMPTY_FILTERS = {
  seasons: [],
  tags: [],
  bases: [],
  cuisines: [],
  difficulties: []
}

export default function RecipesPage() {
  const { t, recipes } = useApp()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!recipe.name.toLowerCase().includes(query)) {
          return false
        }
      }

      // Seasons filter (if not all 4 selected, filter by selected)
      if (filters.seasons.length > 0 && filters.seasons.length < 4) {
        const recipeSeasons = recipe.seasons || []
        const hasMatchingSeason = filters.seasons.some(s => recipeSeasons.includes(s))
        if (!hasMatchingSeason) {
          return false
        }
      }

      // Tags filter (recipe must have ALL selected tags)
      if (filters.tags.length > 0) {
        const recipeTags = recipe.recipe_tags?.map(rt => rt.tag_id) || []
        const hasAllTags = filters.tags.every(tagId => recipeTags.includes(tagId))
        if (!hasAllTags) {
          return false
        }
      }

      // Bases filter (recipe must have ONE of selected bases)
      if (filters.bases.length > 0) {
        if (!recipe.base_id || !filters.bases.includes(recipe.base_id)) {
          return false
        }
      }

      // Cuisines filter (recipe must have ONE of selected cuisines)
      if (filters.cuisines.length > 0) {
        if (!recipe.cuisine_id || !filters.cuisines.includes(recipe.cuisine_id)) {
          return false
        }
      }

      // Difficulty filter
      if (filters.difficulties.length > 0) {
        if (!filters.difficulties.includes(recipe.difficulty)) {
          return false
        }
      }

      return true
    })
  }, [recipes, searchQuery, filters])

  const handleAddRecipe = () => {
    setEditingRecipe(null)
    setShowForm(true)
  }

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRecipe(null)
  }

  const hasActiveFilters = 
    filters.seasons.length > 0 ||
    filters.tags.length > 0 ||
    filters.bases.length > 0 ||
    filters.cuisines.length > 0 ||
    filters.difficulties.length > 0

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>{t('recipes.title')}</h1>
        <button onClick={handleAddRecipe} style={styles.addButton}>
          + {t('recipes.add')}
        </button>
      </header>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('recipes.search')}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={styles.clearSearch}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <FilterPanel filters={filters} onChange={setFilters} />

      {/* Results count */}
      {(searchQuery || hasActiveFilters) && (
        <div style={styles.resultsCount}>
          {filteredRecipes.length} / {recipes.length} {t('nav.recipes').toLowerCase()}
        </div>
      )}

      {/* Recipe list */}
      <div style={styles.list}>
        {filteredRecipes.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>
              {recipes.length === 0 
                ? t('recipes.empty')
                : t('recipes.emptyFiltered')
              }
            </p>
            {recipes.length === 0 && (
              <button onClick={handleAddRecipe} style={styles.emptyButton}>
                + {t('recipes.add')}
              </button>
            )}
          </div>
        ) : (
          filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => handleEditRecipe(recipe)}
            />
          ))
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={handleCloseForm}
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

  addButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary,
    fontSize: fontSizes.sm
  },

  searchContainer: {
    position: 'relative',
    marginBottom: spacing.md
  },

  searchInput: {
    ...commonStyles.input,
    padding: `${spacing.sm} ${spacing.md}`,
    paddingRight: '40px',
    fontSize: fontSizes.md
  },

  clearSearch: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: colors.warmGray,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    fontSize: fontSizes.xs,
    color: colors.textSecondary
  },

  resultsCount: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md
  },

  empty: {
    textAlign: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl
  },

  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md
  },

  emptyButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary
  }
}