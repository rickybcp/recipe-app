import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, commonStyles, getSeasonColor } from '../lib/theme'
import { SEASONS, DIFFICULTIES, getSeasonEmoji } from '../lib/i18n'

export default function RecipeForm({ recipe, onClose }) {
  const { 
    t, getName, language,
    tags, bases, cuisines,
    createRecipe, updateRecipe, deleteRecipe,
    recipes
  } = useApp()

  const isEditing = !!recipe

  // Form state
  const [name, setName] = useState(recipe?.name || '')
  const [seasons, setSeasons] = useState(recipe?.seasons || [])
  const [selectedTags, setSelectedTags] = useState(
    recipe?.recipe_tags?.map(rt => rt.tag_id) || []
  )
  const [baseId, setBaseId] = useState(recipe?.base_id || '')
  const [cuisineId, setCuisineId] = useState(recipe?.cuisine_id || '')
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || 'medium')
  const [prepTime, setPrepTime] = useState(recipe?.prep_time_minutes?.toString() || '')
  const [notes, setNotes] = useState(recipe?.notes || '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Check for duplicate name
  const isDuplicate = recipes.some(r => 
    r.name.toLowerCase() === name.trim().toLowerCase() && 
    r.id !== recipe?.id
  )

  const handleSeasonToggle = (season) => {
    setSeasons(prev => 
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    )
  }

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) return
    if (isDuplicate) {
      setError('recipe.name.duplicate')
      return
    }

    setSaving(true)
    setError(null)

    const recipeData = {
      name: name.trim(),
      seasons,
      base_id: baseId || null,
      cuisine_id: cuisineId || null,
      difficulty,
      prep_time_minutes: prepTime ? parseInt(prepTime, 10) : null,
      notes: notes.trim() || null
    }

    try {
      if (isEditing) {
        await updateRecipe(recipe.id, recipeData, selectedTags)
      } else {
        await createRecipe(recipeData, selectedTags)
      }
      onClose()
    } catch (err) {
      console.error('Save recipe error:', err)
      setError('common.error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t('recipe.deleteConfirm'))) return
    
    setSaving(true)
    try {
      await deleteRecipe(recipe.id)
      onClose()
    } catch (err) {
      console.error('Delete recipe error:', err)
      setError('common.error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isEditing ? t('recipe.edit') : t('recipe.new')}
          </h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name */}
          <div style={styles.field}>
            <label style={commonStyles.label}>{t('recipe.name')} *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('recipe.name.placeholder')}
              style={{
                ...styles.input,
                borderColor: isDuplicate ? colors.error : colors.warmGrayDark
              }}
              required
              autoFocus
            />
            {isDuplicate && (
              <span style={styles.errorText}>{t('recipe.name.duplicate')}</span>
            )}
          </div>

          {/* Seasons */}
          <div style={styles.field}>
            <label style={commonStyles.label}>{t('recipe.seasons')}</label>
            <div style={styles.chipGroup}>
              {SEASONS.map(season => (
                <button
                  key={season}
                  type="button"
                  onClick={() => handleSeasonToggle(season)}
                  style={{
                    ...styles.chip,
                    backgroundColor: seasons.includes(season) 
                      ? getSeasonColor(season) + '30'
                      : colors.warmGray,
                    color: seasons.includes(season)
                      ? getSeasonColor(season)
                      : colors.textSecondary,
                    borderColor: seasons.includes(season)
                      ? getSeasonColor(season)
                      : 'transparent'
                  }}
                >
                  {getSeasonEmoji(season)} {t(`season.${season}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={styles.field}>
            <label style={commonStyles.label}>{t('recipe.tags')}</label>
            <div style={styles.chipGroup}>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  style={{
                    ...styles.chip,
                    backgroundColor: selectedTags.includes(tag.id)
                      ? colors.forest + '20'
                      : colors.warmGray,
                    color: selectedTags.includes(tag.id)
                      ? colors.forest
                      : colors.textSecondary,
                    borderColor: selectedTags.includes(tag.id)
                      ? colors.forest
                      : 'transparent'
                  }}
                >
                  {tag.icon} {getName(tag)}
                </button>
              ))}
            </div>
          </div>

          {/* Base (féculent) */}
          <div style={styles.field}>
            <label style={commonStyles.label}>{t('recipe.base')}</label>
            <select
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              style={styles.select}
            >
              <option value="">{t('recipe.base.none')}</option>
              {bases.map(base => (
                <option key={base.id} value={base.id}>
                  {getName(base)}
                </option>
              ))}
            </select>
          </div>

          {/* Cuisine */}
          <div style={styles.field}>
            <label style={commonStyles.label}>{t('recipe.cuisine')}</label>
            <select
              value={cuisineId}
              onChange={(e) => setCuisineId(e.target.value)}
              style={styles.select}
            >
              <option value="">{t('recipe.cuisine.none')}</option>
              {cuisines.map(cuisine => (
                <option key={cuisine.id} value={cuisine.id}>
                  {cuisine.flag} {getName(cuisine)}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div style={styles.field}>
            <label style={commonStyles.label}>{t('recipe.difficulty')}</label>
            <div style={styles.radioGroup}>
              {DIFFICULTIES.map(diff => (
                <label key={diff} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={diff}
                    checked={difficulty === diff}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={styles.radio}
                  />
                  {t(`difficulty.${diff}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Prep time */}
          <div style={styles.field}>
            <label style={commonStyles.label}>{t('recipe.prepTime')}</label>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder={t('recipe.prepTime.placeholder')}
              style={{ ...styles.input, width: '120px' }}
              min="1"
              max="600"
            />
          </div>

          {/* Notes */}
          <div style={styles.field}>
            <label style={commonStyles.label}>{t('recipe.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('recipe.notes.placeholder')}
              style={styles.textarea}
              rows={4}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={styles.error}>{t(error)}</div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                style={styles.deleteButton}
              >
                {t('recipe.delete')}
              </button>
            )}
            <div style={styles.actionsRight}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                style={styles.cancelButton}
              >
                {t('recipe.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim() || isDuplicate}
                style={{
                  ...styles.saveButton,
                  opacity: (saving || !name.trim() || isDuplicate) ? 0.6 : 1
                }}
              >
                {saving ? t('common.loading') : t('recipe.save')}
              </button>
            </div>
          </div>
        </form>
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: spacing.md,
    paddingTop: spacing.xl,
    zIndex: 1000,
    overflowY: 'auto'
  },

  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: '500px',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
    boxShadow: shadows.lg
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottom: `1px solid ${colors.warmGray}`,
    position: 'sticky',
    top: 0,
    backgroundColor: colors.white,
    zIndex: 1
  },

  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.xl,
    color: colors.forest,
    margin: 0
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

  form: {
    padding: spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md
  },

  field: {
    display: 'flex',
    flexDirection: 'column'
  },

  input: {
    ...commonStyles.input,
    padding: spacing.sm
  },

  select: {
    ...commonStyles.input,
    padding: spacing.sm,
    cursor: 'pointer'
  },

  textarea: {
    ...commonStyles.input,
    padding: spacing.sm,
    resize: 'vertical',
    fontFamily: fonts.body
  },

  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs
  },

  chip: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.full,
    border: '2px solid transparent',
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  radioGroup: {
    display: 'flex',
    gap: spacing.md
  },

  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    cursor: 'pointer'
  },

  radio: {
    cursor: 'pointer'
  },

  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs
  },

  error: {
    backgroundColor: colors.errorLight,
    color: colors.error,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: fontSizes.sm,
    textAlign: 'center'
  },

  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTop: `1px solid ${colors.warmGray}`,
    marginTop: spacing.sm
  },

  actionsRight: {
    display: 'flex',
    gap: spacing.sm
  },

  deleteButton: {
    ...commonStyles.buttonBase,
    backgroundColor: 'transparent',
    color: colors.error,
    border: `1px solid ${colors.error}`
  },

  cancelButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonSecondary
  },

  saveButton: {
    ...commonStyles.buttonBase,
    ...commonStyles.buttonPrimary
  }
}