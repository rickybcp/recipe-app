import React from 'react'
import { useApp } from '../contexts/AppContext'
import { theme, getSeasonColor, getDifficultyColor } from '../lib/theme'

export default function RecipeCard({ recipe, onEdit }) {
  const { t, language } = useApp()
  
  const getName = (item) => {
    if (!item) return ''
    return language === 'fr' ? (item.name_fr || item.name) : (item.name_en || item.name)
  }
  
  const getDifficultyEmoji = (diff) => {
    const emojis = { easy: '👍', medium: '👨‍🍳', hard: '🔥' }
    return emojis[diff] || ''
  }
  
  const tagIcons = recipe.tags?.map(tag => tag.icon).filter(Boolean) || []
  
  return (
    <button
      onClick={onEdit}
      style={cardStyles.container}
    >
      <div style={cardStyles.content}>
        <div style={cardStyles.mainInfo}>
          <h3 style={cardStyles.name}>{recipe.name}</h3>
          
          <div style={cardStyles.tagsRow}>
            {tagIcons.length > 0 && (
              <span style={cardStyles.tagIcons}>{tagIcons.join(' ')}</span>
            )}
            {recipe.cuisine && (
              <span style={cardStyles.cuisineFlag}>{recipe.cuisine.flag}</span>
            )}
          </div>
        </div>
        
        <div style={cardStyles.meta}>
          <div style={cardStyles.seasons}>
            {recipe.season?.slice(0, 2).map(s => (
              <span 
                key={s} 
                style={{
                  ...cardStyles.seasonDot,
                  backgroundColor: getSeasonColor(s),
                }}
                title={t(`seasons.${s}`)}
              />
            ))}
            {recipe.season?.length > 2 && (
              <span style={cardStyles.moreSeasons}>+{recipe.season.length - 2}</span>
            )}
          </div>
          
          {recipe.prep_time_minutes && (
            <span style={cardStyles.time}>
              ⏱️ {recipe.prep_time_minutes} {t('minutes')}
            </span>
          )}
          
          <span style={{
            ...cardStyles.difficulty,
            color: getDifficultyColor(recipe.difficulty),
          }}>
            {getDifficultyEmoji(recipe.difficulty)}
          </span>
        </div>
      </div>
      
      {recipe.base && (
        <div style={cardStyles.baseIndicator}>
          {getName(recipe.base)}
        </div>
      )}
      
      <span style={cardStyles.arrow}>›</span>
    </button>
  )
}

const cardStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 16px',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: theme.shadows.sm,
    cursor: 'pointer',
    transition: theme.transitions.fast,
    textAlign: 'left',
  },
  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mainInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  name: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tagsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tagIcons: {
    fontSize: '14px',
  },
  cuisineFlag: {
    fontSize: '14px',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  seasons: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  seasonDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  moreSeasons: {
    fontSize: '10px',
    color: theme.colors.textMuted,
    marginLeft: '2px',
  },
  time: {
    fontSize: '13px',
    color: theme.colors.textSecondary,
  },
  difficulty: {
    fontSize: '14px',
  },
  baseIndicator: {
    padding: '4px 10px',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.full,
    fontSize: '12px',
    fontWeight: '500',
    color: theme.colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  arrow: {
    fontSize: '20px',
    color: theme.colors.textMuted,
    marginLeft: '4px',
  },
}