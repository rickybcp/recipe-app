import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
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
  isSameDay,
  isSameMonth,
  isToday
} from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from '../lib/theme'
import MealPicker from './MealPicker'

export default function CalendarPage() {
  const { t, language, tags, mealPlans, loadMealPlans, deleteMealPlan } = useApp()

  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showMealPicker, setShowMealPicker] = useState(false)

  const locale = language === 'fr' ? fr : enUS

  // Calculate date range based on view mode
  const getDateRange = () => {
    if (viewMode === 'week') {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
      }
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      }
    }
  }

  const { start, end } = getDateRange()
  const days = eachDayOfInterval({ start, end })

  // Load meal plans when date range changes
  useEffect(() => {
    const startStr = format(start, 'yyyy-MM-dd')
    const endStr = format(end, 'yyyy-MM-dd')
    loadMealPlans(startStr, endStr)
  }, [start, end, loadMealPlans])

  // Navigation
  const goToPrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const goToNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get meals for a specific day
  const getMealsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return mealPlans.filter(mp => mp.planned_date === dayStr)
  }

  // Get tags for a recipe
  const getRecipeTags = (recipe) => {
    if (!recipe) return []
    return recipe.recipe_tags
      ?.map(rt => tags.find(tag => tag.id === rt.tag_id))
      .filter(Boolean) || []
  }

  // Handle day click
  const handleDayClick = (day) => {
    setSelectedDate(day)
    setShowMealPicker(true)
  }

  // Handle meal delete
  const handleDeleteMeal = async (e, mealPlanId) => {
    e.stopPropagation()
    try {
      await deleteMealPlan(mealPlanId)
    } catch (error) {
      console.error('Failed to delete meal:', error)
    }
  }

  // Close meal picker
  const handleCloseMealPicker = () => {
    setShowMealPicker(false)
    setSelectedDate(null)
  }

  // Format header title
  const headerTitle = viewMode === 'week'
    ? `${format(start, 'd MMM', { locale })} - ${format(end, 'd MMM yyyy', { locale })}`
    : format(currentDate, 'MMMM yyyy', { locale })

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>{t('calendar.title')}</h1>
      </header>

      {/* View mode toggle */}
      <div style={styles.viewToggle}>
        <button
          onClick={() => setViewMode('week')}
          style={{
            ...styles.viewButton,
            backgroundColor: viewMode === 'week' ? colors.forest : colors.warmGray,
            color: viewMode === 'week' ? colors.white : colors.textPrimary
          }}
        >
          {t('calendar.week')}
        </button>
        <button
          onClick={() => setViewMode('month')}
          style={{
            ...styles.viewButton,
            backgroundColor: viewMode === 'month' ? colors.forest : colors.warmGray,
            color: viewMode === 'month' ? colors.white : colors.textPrimary
          }}
        >
          {t('calendar.month')}
        </button>
      </div>

      {/* Navigation */}
      <div style={styles.navigation}>
        <button onClick={goToPrevious} style={styles.navButton}>←</button>
        <div style={styles.navCenter}>
          <span style={styles.navTitle}>{headerTitle}</span>
          <button onClick={goToToday} style={styles.todayButton}>
            {t('calendar.today')}
          </button>
        </div>
        <button onClick={goToNext} style={styles.navButton}>→</button>
      </div>

      {/* Calendar grid */}
      <div style={{
        ...styles.grid,
        gridTemplateColumns: viewMode === 'week' ? 'repeat(7, 1fr)' : 'repeat(7, 1fr)'
      }}>
        {/* Day headers */}
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
          <div key={index} style={styles.dayHeader}>
            {language === 'en' 
              ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]
              : day
            }
          </div>
        ))}

        {/* Days */}
        {days.map(day => {
          const meals = getMealsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isDayToday = isToday(day)

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              style={{
                ...styles.dayCell,
                ...(viewMode === 'month' && !isCurrentMonth ? styles.dayCellOutside : {}),
                ...(isDayToday ? styles.dayCellToday : {})
              }}
            >
              <div style={styles.dayNumber}>
                {format(day, 'd')}
              </div>
              <div style={styles.meals}>
                {meals.map(meal => {
                  const recipeTags = getRecipeTags(meal.recipe)
                  return (
                    <div key={meal.id} style={styles.mealItem}>
                      <div style={styles.mealContent}>
                        <span style={styles.mealName}>
                          {meal.recipe?.name || '?'}
                        </span>
                        {recipeTags.length > 0 && (
                          <span style={styles.mealTags}>
                            {recipeTags.slice(0, 2).map(tag => tag.icon).join('')}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteMeal(e, meal.id)}
                        style={styles.mealDelete}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
              <div style={styles.addMeal}>+</div>
            </div>
          )
        })}
      </div>

      {/* Meal picker modal */}
      {showMealPicker && selectedDate && (
        <MealPicker
          date={selectedDate}
          onClose={handleCloseMealPicker}
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
    marginBottom: spacing.md
  },

  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['2xl'],
    color: colors.forest,
    margin: 0
  },

  viewToggle: {
    display: 'flex',
    gap: spacing.xs,
    marginBottom: spacing.md
  },

  viewButton: {
    flex: 1,
    padding: spacing.sm,
    border: 'none',
    borderRadius: borderRadius.md,
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  navigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },

  navButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${colors.warmGray}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    fontSize: fontSizes.lg,
    cursor: 'pointer',
    color: colors.textPrimary
  },

  navCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },

  navTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textTransform: 'capitalize'
  },

  todayButton: {
    padding: `2px ${spacing.sm}`,
    backgroundColor: colors.warmGray,
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontFamily: fonts.body
  },

  grid: {
    display: 'grid',
    gap: '1px',
    backgroundColor: colors.warmGray,
    borderRadius: borderRadius.md,
    overflow: 'hidden'
  },

  dayHeader: {
    backgroundColor: colors.forest,
    color: colors.white,
    padding: spacing.sm,
    textAlign: 'center',
    fontSize: fontSizes.xs,
    fontWeight: 600
  },

  dayCell: {
    backgroundColor: colors.white,
    minHeight: '100px',
    padding: spacing.xs,
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease'
  },

  dayCellOutside: {
    backgroundColor: colors.cream,
    opacity: 0.6
  },

  dayCellToday: {
    backgroundColor: colors.successLight
  },

  dayNumber: {
    fontSize: fontSizes.sm,
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: spacing.xs
  },

  meals: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  mealItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.forest + '15',
    borderRadius: borderRadius.sm,
    padding: '2px 4px',
    fontSize: fontSizes.xs
  },

  mealContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflow: 'hidden',
    flex: 1
  },

  mealName: {
    color: colors.forest,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  mealTags: {
    fontSize: '10px',
    flexShrink: 0
  },

  mealDelete: {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.textMuted,
    fontSize: '10px',
    cursor: 'pointer',
    borderRadius: borderRadius.full,
    flexShrink: 0
  },

  addMeal: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warmGray,
    borderRadius: borderRadius.full,
    fontSize: fontSizes.sm,
    color: colors.textMuted
  }
}