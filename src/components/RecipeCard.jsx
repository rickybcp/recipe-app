import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, getSeasonColor, getDifficultyColor } from '../lib/theme'
import { getSeasonEmoji } from '../lib/i18n'

export default function RecipeCard({ recipe, onClick }) {
  const { t, getName, tags } = useApp()

  // Get tag objects for this recipe
  const recipeTags = recipe.recipe_tags
    ?.map(rt => tags.find(tag => tag.id === rt.tag_id))
    .filter(Boolean) || []

  return (
    <div style={styles.card} onClick={onClick}>
      {/* Header with name and difficulty */}
      <div style={styles.header}>
        <h3 style={styles.name}>{recipe.name}</h3>
        {recipe.difficulty && (
          <span style={{
            ...styles.difficulty,
            backgroundColor: getDifficultyColor(recipe.difficulty) + '20',
            color: getDifficultyColor(recipe.difficulty)
          }}>
            {t(`difficulty.${recipe.difficulty}`)}
          </span>
        )}
      </div>

      {/* Meta info row */}
      <div style={styles.meta}>
        {/* Cuisine */}
        {recipe.cuisine && (
          <span style={styles.metaItem}>
            {recipe.cuisine.flag} {getName(recipe.cuisine)}
          </span>
        )}

        {/* Prep time */}
        {recipe.prep_time_minutes && (
          <span style={styles.metaItem}>
            ⏱️ {recipe.prep_time_minutes} {t('common.minutes')}
          </span>
        )}

        {/* Base */}
        {recipe.base && (
          <span style={styles.metaItem}>
            🍚 {getName(recipe.base)}
          </span>
        )}
      </div>

      {/* Seasons */}
      {recipe.seasons && recipe.seasons.length > 0 && (
        <div style={styles.seasons}>
          {recipe.seasons.map(season => (
            <span
              key={season}
              style={{
                ...styles.seasonBadge,
                backgroundColor: getSeasonColor(season) + '20',
                color: getSeasonColor(season)
              }}
            >
              {getSeasonEmoji(season)} {t(`season.${season}`)}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {recipeTags.length > 0 && (
        <div style={styles.tags}>
          {recipeTags.map(tag => (
            <span key={tag.id} style={styles.tag}>
              {tag.icon} {getName(tag)}
            </span>
          ))}
        </div>
      )}

      {/* Notes preview */}
      {recipe.notes && (
        <p style={styles.notes}>
          {recipe.notes.length > 80 
            ? recipe.notes.substring(0, 80) + '...' 
            : recipe.notes}
        </p>
      )}
    </div>
  )
}

// ============================================
// STYLES
// ============================================

const styles = {
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    boxShadow: shadows.sm,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: `1px solid ${colors.warmGray}`
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },

  name: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.lg,
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
    flex: 1
  },

  difficulty: {
    fontSize: fontSizes.xs,
    fontWeight: 600,
    padding: `2px ${spacing.sm}`,
    borderRadius: borderRadius.full,
    whiteSpace: 'nowrap'
  },

  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },

  metaItem: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary
  },

  seasons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm
  },

  seasonBadge: {
    fontSize: fontSizes.xs,
    fontWeight: 600,
    padding: `2px ${spacing.sm}`,
    borderRadius: borderRadius.full
  },

  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm
  },

  tag: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    backgroundColor: colors.warmGray,
    padding: `2px ${spacing.sm}`,
    borderRadius: borderRadius.full
  },

  notes: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    margin: 0,
    fontStyle: 'italic',
    lineHeight: 1.4
  }
}