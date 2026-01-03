import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { theme, getSeasonColor, getDifficultyColor } from '../lib/theme'

export default function FilterPanel() {
  const { t, language, filters, setFilters, tags, bases, cuisines } = useApp()
  const [isExpanded, setIsExpanded] = useState(false)
  
  const seasons = ['winter', 'spring', 'summer', 'autumn']
  const difficulties = ['easy', 'medium', 'hard']
  
  const hasActiveFilters = 
    filters.seasons.length > 0 || 
    filters.bases.length > 0 ||
    filters.cuisines.length > 0 ||
    filters.tags.length > 0 ||
    filters.difficulties.length > 0
  
  const toggleFilter = (type, value) => {
    const current = filters[type]
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    setFilters({ [type]: updated })
  }
  
  const getName = (item) => {
    if (!item) return ''
    return language === 'fr' ? (item.name_fr || item.name) : (item.name_en || item.name)
  }
  
  const getSeasonEmoji = (season) => {
    const emojis = {
      winter: '❄️',
      spring: '🌸',
      summer: '☀️',
      autumn: '🍂'
    }
    return emojis[season] || ''
  }
  
  return (
    <div style={panelStyles.container}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={panelStyles.toggleButton}
      >
        <span style={panelStyles.toggleIcon}>🎛️</span>
        <span style={panelStyles.toggleText}>{t('filters')}</span>
        {hasActiveFilters && (
          <span style={panelStyles.activeBadge}>
            {filters.seasons.length + filters.bases.length + 
             filters.cuisines.length + filters.tags.length + 
             filters.difficulties.length}
          </span>
        )}
        <span style={{
          ...panelStyles.chevron,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div style={panelStyles.content}>
          <div style={panelStyles.section}>
            <span style={panelStyles.sectionTitle}>{t('season')}</span>
            <div style={panelStyles.chips}>
              {seasons.map(season => (
                <button
                  key={season}
                  onClick={() => toggleFilter('seasons', season)}
                  style={{
                    ...panelStyles.chip,
                    backgroundColor: filters.seasons.includes(season) 
                      ? getSeasonColor(season) 
                      : theme.colors.backgroundAlt,
                    color: filters.seasons.includes(season) 
                      ? '#fff' 
                      : theme.colors.text,
                  }}
                >
                  {getSeasonEmoji(season)} {t(`seasons.${season}`)}
                </button>
              ))}
            </div>
          </div>
          
          <div style={panelStyles.section}>
            <span style={panelStyles.sectionTitle}>{t('tags')}</span>
            <div style={panelStyles.chips}>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleFilter('tags', tag.id)}
                  style={{
                    ...panelStyles.chip,
                    backgroundColor: filters.tags.includes(tag.id) 
                      ? theme.colors.primary 
                      : theme.colors.backgroundAlt,
                    color: filters.tags.includes(tag.id) 
                      ? '#fff' 
                      : theme.colors.text,
                  }}
                >
                  {tag.icon} {getName(tag)}
                </button>
              ))}
            </div>
          </div>
          
          <div style={panelStyles.section}>
            <span style={panelStyles.sectionTitle}>{t('base')}</span>
            <div style={panelStyles.chips}>
              {bases.map(base => (
                <button
                  key={base.id}
                  onClick={() => toggleFilter('bases', base.id)}
                  style={{
                    ...panelStyles.chip,
                    backgroundColor: filters.bases.includes(base.id) 
                      ? theme.colors.accent 
                      : theme.colors.backgroundAlt,
                    color: filters.bases.includes(base.id) 
                      ? theme.colors.text 
                      : theme.colors.text,
                  }}
                >
                  {getName(base)}
                </button>
              ))}
            </div>
          </div>
          
          <div style={panelStyles.section}>
            <span style={panelStyles.sectionTitle}>{t('cuisine')}</span>
            <div style={panelStyles.chips}>
              {cuisines.map(cuisine => (
                <button
                  key={cuisine.id}
                  onClick={() => toggleFilter('cuisines', cuisine.id)}
                  style={{
                    ...panelStyles.chip,
                    backgroundColor: filters.cuisines.includes(cuisine.id) 
                      ? theme.colors.secondary 
                      : theme.colors.backgroundAlt,
                    color: filters.cuisines.includes(cuisine.id) 
                      ? '#fff' 
                      : theme.colors.text,
                  }}
                >
                  {cuisine.flag} {getName(cuisine)}
                </button>
              ))}
            </div>
          </div>
          
          <div style={panelStyles.section}>
            <span style={panelStyles.sectionTitle}>{t('difficulty')}</span>
            <div style={panelStyles.chips}>
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => toggleFilter('difficulties', diff)}
                  style={{
                    ...panelStyles.chip,
                    backgroundColor: filters.difficulties.includes(diff) 
                      ? getDifficultyColor(diff) 
                      : theme.colors.backgroundAlt,
                    color: filters.difficulties.includes(diff) 
                      ? '#fff' 
                      : theme.colors.text,
                  }}
                >
                  {t(`difficulties.${diff}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const panelStyles = {
  container: {
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  toggleButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    maxWidth: '632px',
    margin: '0 auto',
  },
  toggleIcon: {
    fontSize: '16px',
  },
  toggleText: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'left',
  },
  activeBadge: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: theme.borderRadius.full,
    minWidth: '20px',
    textAlign: 'center',
  },
  chevron: {
    fontSize: '10px',
    color: theme.colors.textSecondary,
    transition: theme.transitions.fast,
  },
  content: {
    padding: '0 16px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '632px',
    margin: '0 auto',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chip: {
    padding: '6px 12px',
    borderRadius: theme.borderRadius.full,
    fontSize: '13px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: theme.transitions.fast,
    whiteSpace: 'nowrap',
  },
}