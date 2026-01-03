import React, { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { theme, styles, getSeasonColor, getDifficultyColor } from '../lib/theme'

export default function RecipeForm({ recipe, onClose }) {
  const { t, language, tags, bases, cuisines, addRecipe, updateRecipe, deleteRecipe } = useApp()
  const isEditing = !!recipe
  
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    season: [],
    base_id: null,
    cuisine_id: null,
    difficulty: 'easy',
    prep_time_minutes: '',
    notes: '',
    tags: [],
  })
  
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        season: recipe.season || [],
        base_id: recipe.base_id || null,
        cuisine_id: recipe.cuisine_id || null,
        difficulty: recipe.difficulty || 'easy',
        prep_time_minutes: recipe.prep_time_minutes || '',
        notes: recipe.notes || '',
        tags: recipe.tags?.map(t => t.id) || [],
      })
    }
  }, [recipe])
  
  const getName = (item) => {
    if (!item) return ''
    return language === 'fr' ? (item.name_fr || item.name) : (item.name_en || item.name)
  }
  
  const seasons = ['winter', 'spring', 'summer', 'autumn']
  const difficulties = ['easy', 'medium', 'hard']
  
  const getSeasonEmoji = (season) => {
    const emojis = {
      winter: '❄️',
      spring: '🌸',
      summer: '☀️',
      autumn: '🍂'
    }
    return emojis[season] || ''
  }
  
  const toggleSeason = (season) => {
    setFormData(prev => ({
      ...prev,
      season: prev.season.includes(season)
        ? prev.season.filter(s => s !== season)
        : [...prev.season, season]
    }))
  }
  
  const toggleTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    setLoading(true)
    try {
      const data = {
        ...formData,
        prep_time_minutes: formData.prep_time_minutes ? parseInt(formData.prep_time_minutes) : null,
      }
      
      if (isEditing) {
        await updateRecipe(recipe.id, data)
      } else {
        await addRecipe(data)
      }
      onClose()
    } catch (error) {
      console.error('Error saving recipe:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteRecipe(recipe.id)
      onClose()
    } catch (error) {
      console.error('Error deleting recipe:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div style={formStyles.overlay} onClick={onClose}>
      <div style={formStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={formStyles.header}>
          <h2 style={formStyles.title}>
            {isEditing ? t('editRecipe') : t('addRecipe')}
          </h2>
          <button onClick={onClose} style={formStyles.closeButton}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={formStyles.form}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>{t('recipeName')} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Spaghetti Bolognese"
              required
              style={formStyles.input}
              autoFocus
            />
          </div>
          
          <div style={formStyles.field}>
            <label style={formStyles.label}>{t('season')}</label>
            <div style={formStyles.chips}>
              {seasons.map(season => (
                <button
                  key={season}
                  type="button"
                  onClick={() => toggleSeason(season)}
                  style={{
                    ...formStyles.chip,
                    backgroundColor: formData.season.includes(season)
                      ? getSeasonColor(season)
                      : theme.colors.backgroundAlt,
                    color: formData.season.includes(season) ? '#fff' : theme.colors.text,
                  }}
                >
                  {getSeasonEmoji(season)} {t(`seasons.${season}`)}
                </button>
              ))}
            </div>
          </div>
          
          <div style={formStyles.field}>
            <label style={formStyles.label}>{t('tags')}</label>
            <div style={formStyles.chips}>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    ...formStyles.chip,
                    backgroundColor: formData.tags.includes(tag.id)
                      ? theme.colors.primary
                      : theme.colors.backgroundAlt,
                    color: formData.tags.includes(tag.id) ? '#fff' : theme.colors.text,
                  }}
                >
                  {tag.icon} {getName(tag)}
                </button>
              ))}
            </div>
          </div>
          
          <div style={formStyles.field}>
            <label style={formStyles.label}>{t('base')}</label>
            <select
              value={formData.base_id || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                base_id: e.target.value || null 
              }))}
              style={formStyles.select}
            >
              <option value="">{t('none')}</option>
              {bases.map(base => (
                <option key={base.id} value={base.id}>
                  {getName(base)}
                </option>
              ))}
            </select>
          </div>
          
          <div style={formStyles.field}>
            <label style={formStyles.label}>{t('cuisine')}</label>
            <select
              value={formData.cuisine_id || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                cuisine_id: e.target.value || null 
              }))}
              style={formStyles.select}
            >
              <option value="">{t('none')}</option>
              {cuisines.map(cuisine => (
                <option key={cuisine.id} value={cuisine.id}>
                  {cuisine.flag} {getName(cuisine)}
                </option>
              ))}
            </select>
          </div>
          
          <div style={formStyles.row}>
            <div style={{ ...formStyles.field, flex: 1 }}>
              <label style={formStyles.label}>{t('difficulty')}</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value 
                }))}
                style={formStyles.select}
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {t(`difficulties.${diff}`)}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ ...formStyles.field, flex: 1 }}>
              <label style={formStyles.label}>{t('prepTime')} ({t('minutes')})</label>
              <input
                type="number"
                value={formData.prep_time_minutes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  prep_time_minutes: e.target.value 
                }))}
                placeholder="30"
                min="0"
                style={formStyles.input}
              />
            </div>
          </div>
          
          <div style={formStyles.field}>
            <label style={formStyles.label}>
              {t('notes')} <span style={formStyles.optional}>({t('optional')})</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Astuces, variantes..."
              rows={3}
              style={formStyles.textarea}
            />
          </div>
          
          <div style={formStyles.actions}>
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={formStyles.deleteButton}
              >
                {t('delete')}
              </button>
            )}
            <div style={formStyles.rightActions}>
              <button
                type="button"
                onClick={onClose}
                style={formStyles.cancelButton}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                style={{
                  ...formStyles.submitButton,
                  opacity: loading || !formData.name.trim() ? 0.7 : 1,
                }}
              >
                {loading ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </form>
        
        {showDeleteConfirm && (
          <div style={formStyles.confirmOverlay}>
            <div style={formStyles.confirmBox}>
              <p style={formStyles.confirmText}>{t('deleteConfirm')}</p>
              <div style={formStyles.confirmActions}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={formStyles.cancelButton}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  style={formStyles.confirmDeleteButton}
                >
                  {loading ? t('loading') : t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const formStyles = {
  overlay: {
    ...styles.modalOverlay,
    alignItems: 'flex-end',
  },
  modal: {
    ...styles.modalContent,
    maxHeight: '95vh',
    borderRadius: `${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 0 20px',
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colors.surface,
    zIndex: 1,
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
  },
  optional: {
    fontWeight: '400',
    color: theme.colors.textMuted,
  },
  input: {
    ...styles.input,
  },
  select: {
    ...styles.input,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  },
  textarea: {
    ...styles.input,
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chip: {
    padding: '8px 14px',
    borderRadius: theme.borderRadius.full,
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: theme.transitions.fast,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  rightActions: {
    display: 'flex',
    gap: '12px',
    marginLeft: 'auto',
  },
  cancelButton: {
    ...styles.buttonGhost,
    color: theme.colors.textSecondary,
  },
  submitButton: {
    ...styles.buttonPrimary,
  },
  deleteButton: {
    ...styles.buttonGhost,
    color: theme.colors.error,
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderRadius: theme.borderRadius.xl,
  },
  confirmBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: '24px',
    maxWidth: '300px',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: '15px',
    color: theme.colors.text,
    margin: '0 0 20px 0',
  },
  confirmActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  confirmDeleteButton: {
    ...styles.buttonPrimary,
    backgroundColor: theme.colors.error,
  },
}