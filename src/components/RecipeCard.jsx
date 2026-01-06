import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, getSeasonColor, getDifficultyColor } from '../lib/theme'
import { getSeasonEmoji, getMealTypeEmoji, getPriceRangeSymbol } from '../lib/i18n'

export default function RecipeCard({ recipe, onClick }) {
  const { t, getName, tags } = useApp()

  // Get tag objects for this recipe
  const recipeTags = recipe.recipe_tags
    ?.map(rt => tags.find(tag => tag.id === rt.tag_id))
    .filter(Boolean) || []

  return (
    <div style={styles.card} onClick={onClick}>
      {/* Header with name and badges */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <span style={styles.mealTypeEmoji}>
            {getMealTypeEmoji(recipe.meal_type)}
          </span>
          <h3 style={styles.name}>{recipe.name}</h3>
        </div>
        <div style={styles.badges}>
          {recipe.price_range && (
            <span style={styles.priceBadge}>
              {getPriceRangeSymbol(recipe.price_range)}
            </span>
          )}
          {recipe.difficulty && (
            <span style={{
              ...styles.badge,
              backgroundColor: getDifficultyColor(recipe.difficulty) + '20',
              color: getDifficultyColor(recipe.difficulty)
            }}>
              {t(`difficulty.${recipe.difficulty}`)}
            </span>
          )}
        </div>
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

        {/* Meal type if not main */}
        {recipe.meal_type && recipe.meal_type !== 'main' && (
          <span style={styles.metaItem}>
            {t(`mealType.${recipe.meal_type}`)}
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

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },

  mealTypeEmoji: {
    fontSize: fontSizes.lg
  },

  name: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.lg,
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
    flex: 1
  },

  badges: {
    display: 'flex',
    gap: spacing.xs,
    flexShrink: 0
  },

  badge: {
    fontSize: fontSizes.xs,
    fontWeight: 600,
    padding: `2px ${spacing.sm}`,
    borderRadius: borderRadius.full,
    whiteSpace: 'nowrap'
  },

  priceBadge: {
    fontSize: fontSizes.xs,
    fontWeight: 700,
    padding: `2px ${spacing.sm}`,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gold + '25',
    color: colors.gold
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