import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, borderRadius, getSeasonColor } from '../lib/theme'
import { SEASONS, DIFFICULTIES, getSeasonEmoji } from '../lib/i18n'

export default function FilterPanel({ filters, onChange }) {
  const { t, getName, tags, bases, cuisines } = useApp()
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = 
    filters.seasons.length > 0 ||
    filters.tags.length > 0 ||
    filters.bases.length > 0 ||
    filters.cuisines.length > 0 ||
    filters.difficulties.length > 0

  const handleSeasonToggle = (season) => {
    const newSeasons = filters.seasons.includes(season)
      ? filters.seasons.filter(s => s !== season)
      : [...filters.seasons, season]
    onChange({ ...filters, seasons: newSeasons })
  }

  const handleTagToggle = (tagId) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId]
    onChange({ ...filters, tags: newTags })
  }

  const handleBaseToggle = (baseId) => {
    const newBases = filters.bases.includes(baseId)
      ? filters.bases.filter(id => id !== baseId)
      : [...filters.bases, baseId]
    onChange({ ...filters, bases: newBases })
  }

  const handleCuisineToggle = (cuisineId) => {
    const newCuisines = filters.cuisines.includes(cuisineId)
      ? filters.cuisines.filter(id => id !== cuisineId)
      : [...filters.cuisines, cuisineId]
    onChange({ ...filters, cuisines: newCuisines })
  }

  const handleDifficultyToggle = (difficulty) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty]
    onChange({ ...filters, difficulties: newDifficulties })
  }

  const clearFilters = () => {
    onChange({
      seasons: [],
      tags: [],
      bases: [],
      cuisines: [],
      difficulties: []
    })
  }

  return (
    <div style={styles.container}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={styles.toggleButton}
      >
        <span style={styles.toggleText}>
          🔍 {t('recipes.filters')}
          {hasActiveFilters && (
            <span style={styles.badge}>●</span>
          )}
        </span>
        <span style={{
          ...styles.arrow,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </button>

      {/* Expandable panel */}
      {isExpanded && (
        <div style={styles.panel}>
          {/* Seasons */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>{t('recipe.seasons')}</label>
            <div style={styles.chipGroup}>
              {SEASONS.map(season => (
                <button
                  key={season}
                  type="button"
                  onClick={() => handleSeasonToggle(season)}
                  style={{
                    ...styles.chip,
                    backgroundColor: filters.seasons.includes(season)
                      ? getSeasonColor(season) + '30'
                      : colors.white,
                    color: filters.seasons.includes(season)
                      ? getSeasonColor(season)
                      : colors.textSecondary,
                    borderColor: filters.seasons.includes(season)
                      ? getSeasonColor(season)
                      : colors.warmGrayDark
                  }}
                >
                  {getSeasonEmoji(season)} {t(`season.${season}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>{t('recipe.tags')}</label>
            <div style={styles.chipGroup}>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  style={{
                    ...styles.chip,
                    backgroundColor: filters.tags.includes(tag.id)
                      ? colors.forest + '20'
                      : colors.white,
                    color: filters.tags.includes(tag.id)
                      ? colors.forest
                      : colors.textSecondary,
                    borderColor: filters.tags.includes(tag.id)
                      ? colors.forest
                      : colors.warmGrayDark
                  }}
                >
                  {tag.icon} {getName(tag)}
                </button>
              ))}
            </div>
          </div>

          {/* Bases */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>{t('recipe.base')}</label>
            <div style={styles.chipGroup}>
              {bases.map(base => (
                <button
                  key={base.id}
                  type="button"
                  onClick={() => handleBaseToggle(base.id)}
                  style={{
                    ...styles.chip,
                    backgroundColor: filters.bases.includes(base.id)
                      ? colors.terracotta + '20'
                      : colors.white,
                    color: filters.bases.includes(base.id)
                      ? colors.terracotta
                      : colors.textSecondary,
                    borderColor: filters.bases.includes(base.id)
                      ? colors.terracotta
                      : colors.warmGrayDark
                  }}
                >
                  {getName(base)}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisines */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>{t('recipe.cuisine')}</label>
            <div style={styles.chipGroup}>
              {cuisines.map(cuisine => (
                <button
                  key={cuisine.id}
                  type="button"
                  onClick={() => handleCuisineToggle(cuisine.id)}
                  style={{
                    ...styles.chip,
                    backgroundColor: filters.cuisines.includes(cuisine.id)
                      ? colors.gold + '30'
                      : colors.white,
                    color: filters.cuisines.includes(cuisine.id)
                      ? colors.gold
                      : colors.textSecondary,
                    borderColor: filters.cuisines.includes(cuisine.id)
                      ? colors.gold
                      : colors.warmGrayDark
                  }}
                >
                  {cuisine.flag} {getName(cuisine)}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>{t('recipe.difficulty')}</label>
            <div style={styles.chipGroup}>
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => handleDifficultyToggle(diff)}
                  style={{
                    ...styles.chip,
                    backgroundColor: filters.difficulties.includes(diff)
                      ? colors.forest + '20'
                      : colors.white,
                    color: filters.difficulties.includes(diff)
                      ? colors.forest
                      : colors.textSecondary,
                    borderColor: filters.difficulties.includes(diff)
                      ? colors.forest
                      : colors.warmGrayDark
                  }}
                >
                  {t(`difficulty.${diff}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button onClick={clearFilters} style={styles.clearButton}>
              ✕ {t('recipes.clearFilters')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    marginBottom: spacing.md
  },

  toggleButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.white,
    border: `1px solid ${colors.warmGray}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textPrimary
  },

  toggleText: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs
  },

  badge: {
    color: colors.forest,
    fontSize: '10px',
    marginLeft: '4px'
  },

  arrow: {
    fontSize: '10px',
    color: colors.textMuted,
    transition: 'transform 0.2s ease'
  },

  panel: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    border: `1px solid ${colors.warmGray}`,
    borderRadius: borderRadius.md
  },

  section: {
    marginBottom: spacing.md
  },

  sectionLabel: {
    display: 'block',
    fontSize: fontSizes.xs,
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs
  },

  chip: {
    padding: `4px ${spacing.sm}`,
    borderRadius: borderRadius.full,
    border: '1px solid',
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  clearButton: {
    width: '100%',
    padding: spacing.sm,
    backgroundColor: 'transparent',
    border: `1px dashed ${colors.warmGrayDark}`,
    borderRadius: borderRadius.md,
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    cursor: 'pointer',
    marginTop: spacing.sm
  }
}