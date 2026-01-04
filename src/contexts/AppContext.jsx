import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  supabase,
  getSession,
  onAuthStateChange,
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getProfile,
  updateProfile as apiUpdateProfile,
  getTags,
  createTag as apiCreateTag,
  updateTag as apiUpdateTag,
  deleteTag as apiDeleteTag,
  getBases,
  createBase as apiCreateBase,
  updateBase as apiUpdateBase,
  deleteBase as apiDeleteBase,
  getCuisines,
  getRecipes,
  createRecipe as apiCreateRecipe,
  updateRecipe as apiUpdateRecipe,
  deleteRecipe as apiDeleteRecipe,
  getMealPlans,
  createMealPlan as apiCreateMealPlan,
  deleteMealPlan as apiDeleteMealPlan
} from '../lib/supabase'
import { createT, getLocalizedName } from '../lib/i18n'

// ============================================
// CONTEXT
// ============================================

const AppContext = createContext(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

// ============================================
// PROVIDER
// ============================================

export function AppProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Data state
  const [tags, setTags] = useState([])
  const [bases, setBases] = useState([])
  const [cuisines, setCuisines] = useState([])
  const [recipes, setRecipes] = useState([])
  const [mealPlans, setMealPlans] = useState([])
  const [dataLoading, setDataLoading] = useState(false)

  // UI state
  const [currentTab, setCurrentTab] = useState('recipes')

  // Language (from profile or default)
  const language = profile?.language || 'fr'
  const t = useMemo(() => createT(language), [language])

  // Localized name helper
  const getName = useCallback((item) => getLocalizedName(item, language), [language])

  // ============================================
  // AUTH INITIALIZATION
  // ============================================

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const session = await getSession()
        if (mounted && session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    initAuth()

    const subscription = onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user || null)
        if (!session?.user) {
          // Clear all data on logout
          setProfile(null)
          setTags([])
          setBases([])
          setRecipes([])
          setMealPlans([])
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ============================================
  // LOAD USER DATA WHEN AUTHENTICATED
  // ============================================

  useEffect(() => {
    if (!user) return

    let mounted = true

    async function loadUserData() {
      setDataLoading(true)
      try {
        const [profileData, tagsData, basesData, cuisinesData, recipesData] = await Promise.all([
          getProfile(user.id),
          getTags(user.id),
          getBases(user.id),
          getCuisines(),
          getRecipes(user.id)
        ])

        if (mounted) {
          setProfile(profileData)
          setTags(tagsData)
          setBases(basesData)
          setCuisines(cuisinesData)
          setRecipes(recipesData)
        }
      } catch (error) {
        console.error('Load user data error:', error)
      } finally {
        if (mounted) {
          setDataLoading(false)
        }
      }
    }

    loadUserData()

    return () => {
      mounted = false
    }
  }, [user])

  // ============================================
  // AUTH ACTIONS
  // ============================================

  const signIn = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      await apiSignIn(email, password)
    } catch (error) {
      if (error.message.includes('Invalid login')) {
        setAuthError('auth.error.invalid')
      } else {
        setAuthError('auth.error.generic')
      }
      throw error
    }
  }, [])

  const signUp = useCallback(async (email, password, displayName) => {
    setAuthError(null)
    try {
      await apiSignUp(email, password, displayName)
    } catch (error) {
      if (error.message.includes('already registered')) {
        setAuthError('auth.error.exists')
      } else if (error.message.includes('password')) {
        setAuthError('auth.error.weak')
      } else {
        setAuthError('auth.error.generic')
      }
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    await apiSignOut()
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  // ============================================
  // PROFILE ACTIONS
  // ============================================

  const updateLanguage = useCallback(async (newLanguage) => {
    if (!user) return
    const updated = await apiUpdateProfile(user.id, { language: newLanguage })
    setProfile(updated)
  }, [user])

  // ============================================
  // TAG ACTIONS
  // ============================================

  const createTag = useCallback(async (tagData) => {
    if (!user) return
    const newTag = await apiCreateTag(user.id, tagData)
    setTags(prev => [...prev, newTag].sort((a, b) => a.sort_order - b.sort_order))
    return newTag
  }, [user])

  const updateTag = useCallback(async (tagId, tagData) => {
    const updated = await apiUpdateTag(tagId, tagData)
    setTags(prev => prev.map(t => t.id === tagId ? updated : t))
    return updated
  }, [])

  const deleteTag = useCallback(async (tagId) => {
    await apiDeleteTag(tagId)
    setTags(prev => prev.filter(t => t.id !== tagId))
    // Also update recipes that had this tag
    setRecipes(prev => prev.map(r => ({
      ...r,
      recipe_tags: r.recipe_tags.filter(rt => rt.tag_id !== tagId)
    })))
  }, [])

  // ============================================
  // BASE ACTIONS
  // ============================================

  const createBase = useCallback(async (baseData) => {
    if (!user) return
    const newBase = await apiCreateBase(user.id, baseData)
    setBases(prev => [...prev, newBase].sort((a, b) => a.sort_order - b.sort_order))
    return newBase
  }, [user])

  const updateBase = useCallback(async (baseId, baseData) => {
    const updated = await apiUpdateBase(baseId, baseData)
    setBases(prev => prev.map(b => b.id === baseId ? updated : b))
    return updated
  }, [])

  const deleteBase = useCallback(async (baseId) => {
    await apiDeleteBase(baseId)
    setBases(prev => prev.filter(b => b.id !== baseId))
    // Update recipes that had this base
    setRecipes(prev => prev.map(r => 
      r.base_id === baseId ? { ...r, base_id: null, base: null } : r
    ))
  }, [])

  // ============================================
  // RECIPE ACTIONS
  // ============================================

  const createRecipe = useCallback(async (recipeData, tagIds) => {
    if (!user) return
    const newRecipe = await apiCreateRecipe(user.id, recipeData, tagIds)
    // Reload recipes to get full data with relations
    const allRecipes = await getRecipes(user.id)
    setRecipes(allRecipes)
    return newRecipe
  }, [user])

  const updateRecipe = useCallback(async (recipeId, recipeData, tagIds) => {
    if (!user) return
    await apiUpdateRecipe(recipeId, recipeData, tagIds)
    // Reload recipes to get full data with relations
    const allRecipes = await getRecipes(user.id)
    setRecipes(allRecipes)
  }, [user])

  const deleteRecipe = useCallback(async (recipeId) => {
    await apiDeleteRecipe(recipeId)
    setRecipes(prev => prev.filter(r => r.id !== recipeId))
    // Also remove associated meal plans
    setMealPlans(prev => prev.filter(mp => mp.recipe_id !== recipeId))
  }, [])

  // ============================================
  // MEAL PLAN ACTIONS
  // ============================================

  const loadMealPlans = useCallback(async (startDate, endDate) => {
    if (!user) return
    const plans = await getMealPlans(user.id, startDate, endDate)
    setMealPlans(plans)
  }, [user])

  const createMealPlan = useCallback(async (recipeId, plannedDate) => {
    if (!user) return
    const newPlan = await apiCreateMealPlan(user.id, recipeId, plannedDate)
    setMealPlans(prev => [...prev, newPlan])
    return newPlan
  }, [user])

  const deleteMealPlan = useCallback(async (mealPlanId) => {
    await apiDeleteMealPlan(mealPlanId)
    setMealPlans(prev => prev.filter(mp => mp.id !== mealPlanId))
  }, [])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = useMemo(() => ({
    // Auth
    user,
    profile,
    authLoading,
    authError,
    signIn,
    signUp,
    signOut,
    clearAuthError,

    // Data
    tags,
    bases,
    cuisines,
    recipes,
    mealPlans,
    dataLoading,

    // Actions
    updateLanguage,
    createTag,
    updateTag,
    deleteTag,
    createBase,
    updateBase,
    deleteBase,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    loadMealPlans,
    createMealPlan,
    deleteMealPlan,

    // UI
    currentTab,
    setCurrentTab,

    // i18n
    language,
    t,
    getName
  }), [
    user, profile, authLoading, authError,
    signIn, signUp, signOut, clearAuthError,
    tags, bases, cuisines, recipes, mealPlans, dataLoading,
    updateLanguage,
    createTag, updateTag, deleteTag,
    createBase, updateBase, deleteBase,
    createRecipe, updateRecipe, deleteRecipe,
    loadMealPlans, createMealPlan, deleteMealPlan,
    currentTab,
    language, t, getName
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}