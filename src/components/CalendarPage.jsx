import React, { useState, useEffect, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { theme } from '../lib/theme'
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameMonth,
  isToday
} from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import MealPicker from './MealPicker'

export default function CalendarPage() {
  const { t, language, mealPlans, loadMealPlansForRange, deleteMealPlan } = useApp()
  const [view, setView] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showMealPicker, setShowMealPicker] = useState(false)
  
  const locale = language === 'fr' ? fr : enUS
  
  const dateRange = useMemo(() => {
    if (view === 'week') {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
      }
    } else {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return {
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 })
      }
    }
  }, [currentDate, view])
  
  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
  }, [dateRange])
  
  useEffect(() => {
    const start = format(dateRange.start, 'yyyy-MM-dd')
    const end = format(dateRange.end, 'yyyy-MM-dd')
    loadMealPlansForRange(start, end)
  }, [dateRange])
  
  const getMealsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return mealPlans.filter(mp => mp.planned_date === dateStr)
  }
  
  const goToToday = () => setCurrentDate(new Date())
  
  const goToPrev = () => {
    setCurrentDate(prev => view === 'week' ? subWeeks(prev, 1) : subMonths(prev, 1))
  }
  
  const goToNext = () => {
    setCurrentDate(prev => view === 'week' ? addWeeks(prev, 1) : addMonths(prev, 1))
  }
  
  const handleDayClick = (date) => {
    setSelectedDate(date)
    setShowMealPicker(true)
  }
  
  const handleRemoveMeal = async (mealId, e) => {
    e.stopPropagation()
    await deleteMealPlan(mealId)
  }
  
  const getRecipeIcons = (recipe) => {
    if (!recipe) return ''
    const icons = recipe.tags?.map(t => t?.icon).filter(Boolean) || []
    return icons.join(' ')
  }
  
  return (
    <div style={calStyles.container}>
      <div style={calStyles.header}>
        <div style={calStyles.headerTop}>
          <div style={calStyles.viewToggle}>
            <button
              onClick={() => setView('week')}
              style={{
                ...calStyles.toggleButton,
                ...(view === 'week' ? calStyles.toggleButtonActive : {}),
              }}
            >
              {t('weekView')}
            </button>
            <button
              onClick={() => setView('month')}
              style={{
                ...calStyles.toggleButton,
                ...(view === 'month' ? calStyles.toggleButtonActive : {}),
              }}
            >
              {t('monthView')}
            </button>
          </div>
          
          <button onClick={goToToday} style={calStyles.todayButton}>
            {t('today')}
          </button>
        </div>
        
        <div style={calStyles.navigation}>
          <button onClick={goToPrev} style={calStyles.navButton}>‹</button>
          <span style={calStyles.currentPeriod}>
            {view === 'week' 
              ? `${format(dateRange.start, 'd MMM', { locale })} - ${format(dateRange.end, 'd MMM yyyy', { locale })}`
              : format(currentDate, 'MMMM yyyy', { locale })
            }
          </span>
          <button onClick={goToNext} style={calStyles.navButton}>›</button>
        </div>
      </div>
      
      <div style={calStyles.calendarWrapper}>
        <div style={calStyles.weekdayHeader}>
          {t('weekdays.short').map((day, i) => (
            <div key={i} style={calStyles.weekdayCell}>{day}</div>
          ))}
        </div>
        
        <div style={{
          ...calStyles.daysGrid,
          gridTemplateRows: view === 'week' ? '1fr' : `repeat(${Math.ceil(days.length / 7)}, 1fr)`,
        }}>
          {days.map((day, index) => {
            const meals = getMealsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isDayToday = isToday(day)
            
            return (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                style={{
                  ...calStyles.dayCell,
                  ...(view === 'month' && !isCurrentMonth ? calStyles.dayCellOtherMonth : {}),
                  ...(isDayToday ? calStyles.dayCellToday : {}),
                }}
              >
                <span style={{
                  ...calStyles.dayNumber,
                  ...(isDayToday ? calStyles.dayNumberToday : {}),
                }}>
                  {format(day, 'd')}
                </span>
                
                <div style={calStyles.mealsContainer}>
                  {meals.slice(0, view === 'week' ? 5 : 2).map(meal => (
                    <div key={meal.id} style={calStyles.mealItem}>
                      <span style={calStyles.mealName}>
                        {meal.recipe?.name || 'Recipe'}
                      </span>
                      {view === 'week' && (
                        <span style={calStyles.mealIcons}>
                          {getRecipeIcons(meal.recipe)}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleRemoveMeal(meal.id, e)}
                        style={calStyles.removeMealButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {meals.length > (view === 'week' ? 5 : 2) && (
                    <span style={calStyles.moreCount}>
                      +{meals.length - (view === 'week' ? 5 : 2)}
                    </span>
                  )}
                </div>
                
                {meals.length === 0 && (
                  <span style={calStyles.addHint}>+</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {showMealPicker && selectedDate && (
        <MealPicker
          date={selectedDate}
          onClose={() => {
            setShowMealPicker(false)
            setSelectedDate(null)
          }}
        />
      )}
    </div>
  )
}

const calStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  viewToggle: {
    display: 'flex',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    padding: '3px',
  },
  toggleButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    color: theme.colors.textSecondary,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    transition: theme.transitions.fast,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.primary,
    boxShadow: theme.shadows.sm,
  },
  todayButton: {
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: 'transparent',
    border: `1.5px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  navButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: theme.colors.backgroundAlt,
    border: 'none',
    fontSize: '20px',
    color: theme.colors.text,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPeriod: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: '200px',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  calendarWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '8px',
  },
  weekdayHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '4px',
  },
  weekdayCell: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: theme.colors.textSecondary,
    padding: '8px 0',
    textTransform: 'uppercase',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    flex: 1,
  },
  dayCell: {
    display: 'flex',
    flexDirection: 'column',
    padding: '6px',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.borderLight}`,
    cursor: 'pointer',
    textAlign: 'left',
    overflow: 'hidden',
    transition: theme.transitions.fast,
    minHeight: '60px',
  },
  dayCellOtherMonth: {
    opacity: 0.4,
  },
  dayCellToday: {
    borderColor: theme.colors.primary,
    borderWidth: '2px',
  },
  dayNumber: {
    fontSize: '13px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '4px',
  },
  dayNumberToday: {
    color: theme.colors.primary,
  },
  mealsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    overflow: 'hidden',
  },
  mealItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 6px',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
    fontSize: '11px',
  },
  mealName: {
    flex: 1,
    color: '#fff',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mealIcons: {
    fontSize: '10px',
    flexShrink: 0,
  },
  removeMealButton: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    border: 'none',
    color: '#fff',
    fontSize: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    opacity: 0.7,
  },
  moreCount: {
    fontSize: '10px',
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  addHint: {
    fontSize: '18px',
    color: theme.colors.borderLight,
    textAlign: 'center',
    marginTop: 'auto',
  },
}