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
  const [expandedDay, setExpandedDay] = useState(null) // For month view on mobile

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
    setExpandedDay(null)
  }

  const goToNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
    setExpandedDay(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setExpandedDay(null)
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
    if (viewMode === 'month') {
      // Toggle expanded day or open picker if already expanded
      const dayStr = format(day, 'yyyy-MM-dd')
      if (expandedDay === dayStr) {
        setSelectedDate(day)
        setShowMealPicker(true)
      } else {
        setExpandedDay(dayStr)
      }
    } else {
      setSelectedDate(day)
      setShowMealPicker(true)
    }
  }

  // Handle add meal from expanded day
  const handleAddMealFromExpanded = (day) => {
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
          onClick={() => { setViewMode('week'); setExpandedDay(null) }}
          style={{
            ...styles.viewButton,
            backgroundColor: viewMode === 'week' ? colors.forest : colors.warmGray,
            color: viewMode === 'week' ? colors.white : colors.textPrimary
          }}
        >
          {t('calendar.week')}
        </button>
        <button
          onClick={() => { setViewMode('month'); setExpandedDay(null) }}
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

      {/* Calendar content */}
      {viewMode === 'week' ? (
        // WEEK VIEW - Vertical list on mobile
        <div style={styles.weekList}>
          {days.map(day => {
            const meals = getMealsForDay(day)
            const isDayToday = isToday(day)
            const dayName = format(day, 'EEEE', { locale })
            const dayNumber = format(day, 'd MMMM', { locale })

            return (
              <div
                key={day.toISOString()}
                style={{
                  ...styles.weekDay,
                  ...(isDayToday ? styles.weekDayToday : {})
                }}
              >
                {/* Day header */}
                <div style={styles.weekDayHeader}>
                  <div style={styles.weekDayInfo}>
                    <span style={{
                      ...styles.weekDayName,
                      color: isDayToday ? colors.forest : colors.textPrimary
                    }}>
                      {dayName}
                    </span>
                    <span style={styles.weekDayNumber}>{dayNumber}</span>
                  </div>
                  <button
                    onClick={() => handleDayClick(day)}
                    style={styles.addMealButton}
                  >
                    + {t('calendar.addMeal')}
                  </button>
                </div>

                {/* Meals */}
                {meals.length > 0 ? (
                  <div style={styles.weekMeals}>
                    {meals.map(meal => {
                      const recipeTags = getRecipeTags(meal.recipe)
                      return (
                        <div key={meal.id} style={styles.weekMealItem}>
                          <div style={styles.weekMealInfo}>
                            <span style={styles.weekMealName}>
                              {meal.recipe?.name || '?'}
                            </span>
                            {recipeTags.length > 0 && (
                              <span style={styles.weekMealTags}>
                                {recipeTags.map(tag => tag.icon).join(' ')}
                              </span>
                            )}
                            {meal.recipe?.cuisine && (
                              <span style={styles.weekMealCuisine}>
                                {meal.recipe.cuisine.flag}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleDeleteMeal(e, meal.id)}
                            style={styles.weekMealDelete}
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={styles.weekNoMeals}>
                    <span style={styles.weekNoMealsText}>—</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        // MONTH VIEW - Compact grid
        <div style={styles.monthContainer}>
          {/* Day headers */}
          <div style={styles.monthHeaders}>
            {(language === 'fr' 
              ? ['L', 'M', 'M', 'J', 'V', 'S', 'D']
              : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
            ).map((day, index) => (
              <div key={index} style={styles.monthHeader}>
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={styles.monthGrid}>
            {days.map(day => {
              const meals = getMealsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isDayToday = isToday(day)
              const dayStr = format(day, 'yyyy-MM-dd')
              const isExpanded = expandedDay === dayStr

              return (
                <div key={day.toISOString()}>
                  <div
                    onClick={() => handleDayClick(day)}
                    style={{
                      ...styles.monthDay,
                      ...(isCurrentMonth ? {} : styles.monthDayOutside),
                      ...(isDayToday ? styles.monthDayToday : {}),
                      ...(isExpanded ? styles.monthDayExpanded : {})
                    }}
                  >
                    <span style={styles.monthDayNumber}>{format(day, 'd')}</span>
                    {meals.length > 0 && (
                      <div style={styles.monthDots}>
                        {meals.slice(0, 3).map((_, idx) => (
                          <span key={idx} style={styles.monthDot} />
                        ))}
                        {meals.length > 3 && (
                          <span style={styles.monthDotMore}>+</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded day details */}
                  {isExpanded && (
                    <div style={styles.expandedDay}>
                      <div style={styles.expandedHeader}>
                        <span style={styles.expandedDate}>
                          {format(day, 'EEEE d MMMM', { locale })}
                        </span>
                        <button
                          onClick={() => handleAddMealFromExpanded(day)}
                          style={styles.expandedAddButton}
                        >
                          +
                        </button>
                      </div>
                      {meals.length > 0 ? (
                        <div style={styles.expandedMeals}>
                          {meals.map(meal => {
                            const recipeTags = getRecipeTags(meal.recipe)
                            return (
                              <div key={meal.id} style={styles.expandedMealItem}>
                                <span style={styles.expandedMealName}>
                                  {recipeTags.map(tag => tag.icon).join('')} {meal.recipe?.name || '?'}
                                </span>
                                <button
                                  onClick={(e) => handleDeleteMeal(e, meal.id)}
                                  style={styles.expandedMealDelete}
                                >
                                  ✕
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p style={styles.expandedNoMeals}>{t('recipes.empty')}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

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

  // ==================
  // WEEK VIEW STYLES
  // ==================
  weekList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm
  },

  weekDay: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    boxShadow: shadows.sm
  },

  weekDayToday: {
    borderLeft: `4px solid ${colors.forest}`
  },

  weekDayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },

  weekDayInfo: {
    display: 'flex',
    flexDirection: 'column'
  },

  weekDayName: {
    fontSize: fontSizes.md,
    fontWeight: 600,
    textTransform: 'capitalize'
  },

  weekDayNumber: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textTransform: 'capitalize'
  },

  addMealButton: {
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: colors.forest,
    color: colors.white,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    fontWeight: 600,
    cursor: 'pointer'
  },

  weekMeals: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs
  },

  weekMealItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.forest + '10',
    borderRadius: borderRadius.md
  },

  weekMealInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    overflow: 'hidden'
  },

  weekMealName: {
    fontSize: fontSizes.md,
    color: colors.forest,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  weekMealTags: {
    fontSize: fontSizes.sm,
    flexShrink: 0
  },

  weekMealCuisine: {
    fontSize: fontSizes.sm,
    flexShrink: 0
  },

  weekMealDelete: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: colors.white,
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    cursor: 'pointer',
    borderRadius: borderRadius.full,
    flexShrink: 0
  },

  weekNoMeals: {
    padding: spacing.sm,
    textAlign: 'center'
  },

  weekNoMealsText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm
  },

  // ==================
  // MONTH VIEW STYLES
  // ==================
  monthContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    boxShadow: shadows.sm
  },

  monthHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    backgroundColor: colors.forest
  },

  monthHeader: {
    padding: spacing.sm,
    textAlign: 'center',
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: 600
  },

  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: colors.warmGray
  },

  monthDay: {
    backgroundColor: colors.white,
    padding: spacing.xs,
    minHeight: '50px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s ease'
  },

  monthDayOutside: {
    backgroundColor: colors.cream,
    opacity: 0.5
  },

  monthDayToday: {
    backgroundColor: colors.successLight
  },

  monthDayExpanded: {
    backgroundColor: colors.forest + '15'
  },

  monthDayNumber: {
    fontSize: fontSizes.sm,
    fontWeight: 600,
    color: colors.textPrimary
  },

  monthDots: {
    display: 'flex',
    gap: '3px',
    alignItems: 'center'
  },

  monthDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: colors.forest
  },

  monthDotMore: {
    fontSize: '10px',
    color: colors.forest,
    fontWeight: 600
  },

  // Expanded day in month view
  expandedDay: {
    gridColumn: '1 / -1',
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderTop: `1px solid ${colors.warmGray}`
  },

  expandedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },

  expandedDate: {
    fontSize: fontSizes.sm,
    fontWeight: 600,
    color: colors.textPrimary,
    textTransform: 'capitalize'
  },

  expandedAddButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    color: colors.white,
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: fontSizes.md,
    cursor: 'pointer'
  },

  expandedMeals: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs
  },

  expandedMealItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md
  },

  expandedMealName: {
    fontSize: fontSizes.sm,
    color: colors.forest,
    fontWeight: 500
  },

  expandedMealDelete: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    cursor: 'pointer',
    borderRadius: borderRadius.full
  },

  expandedNoMeals: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    margin: 0,
    textAlign: 'center',
    padding: spacing.sm
  }
}