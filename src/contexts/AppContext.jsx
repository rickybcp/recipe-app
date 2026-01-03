import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useTranslation } from '../lib/i18n'

const AppContext = createContext(null)

const initialState = {
  user: null,
  profile: null,
  household: null,
  loading: true,
  recipes: [],
  tags: [],
  bases: [],
  cuisines: [],
  mealPlans: [],
  householdMembers: [],
  language: 'fr',
  currentPage: 'recipes',
  filters: {
    search: '',
    seasons: [],
    bases: [],
    cuisines: [],
    tags: [],
    difficulties: [],
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_PROFILE':
      return { 
        ...state, 
        profile: action.payload,
        language: action.payload?.language || 'fr'
      }
    case 'SET_HOUSEHOLD':
      return { ...state, household: action.payload }
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload }
    case 'ADD_RECIPE':
      return { ...state, recipes: [...state.recipes, action.payload] }
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map(r => 
          r.id === action.payload.id ? action.payload : r
        )
      }
    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter(r => r.id !== action.payload)
      }
    case 'SET_TAGS':
      return { ...state, tags: action.payload }
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] }
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      }
    case 'DELETE_TAG':
      return { ...state, tags: state.tags.filter(t => t.id !== action.payload) }
    case 'SET_BASES':
      return { ...state, bases: action.payload }
    case 'ADD_BASE':
      return { ...state, bases: [...state.bases, action.payload] }
    case 'UPDATE_BASE':
      return {
        ...state,
        bases: state.bases.map(b => 
          b.id === action.payload.id ? action.payload : b
        )
      }
    case 'DELETE_BASE':
      return { ...state, bases: state.bases.filter(b => b.id !== action.payload) }
    case 'SET_CUISINES':
      return { ...state, cuisines: action.payload }
    case 'SET_MEAL_PLANS':
      return { ...state, mealPlans: action.payload }
    case 'ADD_MEAL_PLAN':
      return { ...state, mealPlans: [...state.mealPlans, action.payload] }
    case 'DELETE_MEAL_PLAN':
      return { ...state, mealPlans: state.mealPlans.filter(m => m.id !== action.payload) }
    case 'SET_HOUSEHOLD_MEMBERS':
      return { ...state, householdMembers: action.payload }
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload }
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case 'CLEAR_FILTERS':
      return { 
        ...state, 
        filters: { search: '', seasons: [], bases: [], cuisines: [], tags: [], difficulties: [] }
      }
    case 'LOGOUT':
      return { ...initialState, loading: false, cuisines: state.cuisines }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { t } = useTranslation(state.language)
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          dispatch({ type: 'SET_USER', payload: session.user })
          await loadUserData(session.user.id)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    
    initAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({ type: 'SET_USER', payload: session.user })
          await loadUserData(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' })
        }
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  useEffect(() => {
    const loadCuisines = async () => {
      const { data } = await supabase
        .from('cuisines')
        .select('*')
        .order('name_fr')
      
      if (data) {
        dispatch({ type: 'SET_CUISINES', payload: data })
      }
    }
    loadCuisines()
  }, [])
  
  const loadUserData = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profile) {
        dispatch({ type: 'SET_PROFILE', payload: profile })
        
        if (profile.household_id) {
          const { data: household } = await supabase
            .from('households')
            .select('*')
            .eq('id', profile.household_id)
            .single()
          
          if (household) {
            dispatch({ type: 'SET_HOUSEHOLD', payload: household })
            await loadHouseholdData(profile.household_id)
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }
  
  const loadHouseholdData = async (householdId) => {
    try {
      const { data: recipes } = await supabase
        .from('recipes')
        .select(`
          *,
          base:bases(*),
          cuisine:cuisines(*),
          recipe_tags(tag:tags(*))
        `)
        .eq('household_id', householdId)
        .eq('is_deleted', false)
        .order('name')
      
      if (recipes) {
        const formattedRecipes = recipes.map(r => ({
          ...r,
          tags: r.recipe_tags?.map(rt => rt.tag) || []
        }))
        dispatch({ type: 'SET_RECIPES', payload: formattedRecipes })
      }
      
      const { data: tags } = await supabase
        .from('tags')
        .select('*')
        .eq('household_id', householdId)
        .order('name_fr')
      
      if (tags) {
        dispatch({ type: 'SET_TAGS', payload: tags })
      }
      
      const { data: bases } = await supabase
        .from('bases')
        .select('*')
        .eq('household_id', householdId)
        .order('name_fr')
      
      if (bases) {
        dispatch({ type: 'SET_BASES', payload: bases })
      }
      
      const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .eq('household_id', householdId)
      
      if (members) {
        dispatch({ type: 'SET_HOUSEHOLD_MEMBERS', payload: members })
      }
      
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('household_id', householdId)
        .gte('planned_date', startDate.toISOString().split('T')[0])
        .lte('planned_date', endDate.toISOString().split('T')[0])
        .order('planned_date')
      
      if (mealPlans) {
        dispatch({ type: 'SET_MEAL_PLANS', payload: mealPlans })
      }
    } catch (error) {
      console.error('Error loading household data:', error)
    }
  }
  
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }
  
  const signUp = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    })
    if (error) throw error
    return data
  }
  
  const signOut = async () => {
    await supabase.auth.signOut()
    dispatch({ type: 'LOGOUT' })
  }
  
  const createHousehold = async (name) => {
    const { data, error } = await supabase.rpc('create_household_with_defaults', {
      p_user_id: state.user.id,
      p_household_name: name
    })
    if (error) throw error
    await loadUserData(state.user.id)
    return data
  }
  
  const inviteToHousehold = async (email) => {
    const { data, error } = await supabase
      .from('household_invites')
      .insert({
        household_id: state.household.id,
        email: email.toLowerCase(),
        invited_by: state.user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  const acceptInvite = async (token) => {
    const { data, error } = await supabase.rpc('accept_household_invite', {
      p_token: token
    })
    if (error) throw error
    if (!data.success) throw new Error(data.error)
    await loadUserData(state.user.id)
    return data
  }
  
  const addRecipe = async (recipeData) => {
    const { tags: tagIds, ...recipe } = recipeData
    
    const { data: newRecipe, error } = await supabase
      .from('recipes')
      .insert({
        ...recipe,
        household_id: state.household.id,
        created_by: state.user.id
      })
      .select(`
        *,
        base:bases(*),
        cuisine:cuisines(*)
      `)
      .single()
    
    if (error) throw error
    
    if (tagIds?.length > 0) {
      await supabase
        .from('recipe_tags')
        .insert(tagIds.map(tagId => ({
          recipe_id: newRecipe.id,
          tag_id: tagId
        })))
    }
    
    const { data: completeRecipe } = await supabase
      .from('recipes')
      .select(`
        *,
        base:bases(*),
        cuisine:cuisines(*),
        recipe_tags(tag:tags(*))
      `)
      .eq('id', newRecipe.id)
      .single()
    
    const formattedRecipe = {
      ...completeRecipe,
      tags: completeRecipe.recipe_tags?.map(rt => rt.tag) || []
    }
    
    dispatch({ type: 'ADD_RECIPE', payload: formattedRecipe })
    return formattedRecipe
  }
  
  const updateRecipe = async (id, recipeData) => {
    const { tags: tagIds, ...recipe } = recipeData
    
    const { error } = await supabase
      .from('recipes')
      .update({
        ...recipe,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) throw error
    
    await supabase.from('recipe_tags').delete().eq('recipe_id', id)
    
    if (tagIds?.length > 0) {
      await supabase
        .from('recipe_tags')
        .insert(tagIds.map(tagId => ({
          recipe_id: id,
          tag_id: tagId
        })))
    }
    
    const { data: completeRecipe } = await supabase
      .from('recipes')
      .select(`
        *,
        base:bases(*),
        cuisine:cuisines(*),
        recipe_tags(tag:tags(*))
      `)
      .eq('id', id)
      .single()
    
    const formattedRecipe = {
      ...completeRecipe,
      tags: completeRecipe.recipe_tags?.map(rt => rt.tag) || []
    }
    
    dispatch({ type: 'UPDATE_RECIPE', payload: formattedRecipe })
    return formattedRecipe
  }
  
  const deleteRecipe = async (id) => {
    const { error } = await supabase
      .from('recipes')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) throw error
    dispatch({ type: 'DELETE_RECIPE', payload: id })
  }
  
  const addTag = async (tagData) => {
    const { data, error } = await supabase
      .from('tags')
      .insert({
        ...tagData,
        household_id: state.household.id
      })
      .select()
      .single()
    
    if (error) throw error
    dispatch({ type: 'ADD_TAG', payload: data })
    return data
  }
  
  const updateTag = async (id, tagData) => {
    const { data, error } = await supabase
      .from('tags')
      .update(tagData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    dispatch({ type: 'UPDATE_TAG', payload: data })
    return data
  }
  
  const deleteTag = async (id) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    dispatch({ type: 'DELETE_TAG', payload: id })
  }
  
  const addBase = async (baseData) => {
    const { data, error } = await supabase
      .from('bases')
      .insert({
        ...baseData,
        household_id: state.household.id
      })
      .select()
      .single()
    
    if (error) throw error
    dispatch({ type: 'ADD_BASE', payload: data })
    return data
  }
  
  const updateBase = async (id, baseData) => {
    const { data, error } = await supabase
      .from('bases')
      .update(baseData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    dispatch({ type: 'UPDATE_BASE', payload: data })
    return data
  }
  
  const deleteBase = async (id) => {
    const { error } = await supabase
      .from('bases')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    dispatch({ type: 'DELETE_BASE', payload: id })
  }
  
  const addMealPlan = async (recipeId, plannedDate, mealType = 'dinner') => {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        household_id: state.household.id,
        recipe_id: recipeId,
        planned_date: plannedDate,
        meal_type: mealType,
        created_by: state.user.id
      })
      .select(`
        *,
        recipe:recipes(*)
      `)
      .single()
    
    if (error) throw error
    dispatch({ type: 'ADD_MEAL_PLAN', payload: data })
    return data
  }
  
  const deleteMealPlan = async (id) => {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    dispatch({ type: 'DELETE_MEAL_PLAN', payload: id })
  }
  
  const loadMealPlansForRange = async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        recipe:recipes(*)
      `)
      .eq('household_id', state.household.id)
      .gte('planned_date', startDate)
      .lte('planned_date', endDate)
      .order('planned_date')
    
    if (error) throw error
    dispatch({ type: 'SET_MEAL_PLANS', payload: data || [] })
    return data
  }
  
  const setLanguage = async (lang) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang })
    
    if (state.user) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('id', state.user.id)
    }
  }
  
  const setPage = (page) => {
    dispatch({ type: 'SET_PAGE', payload: page })
  }
  
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }
  
  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }
  
  const getFilteredRecipes = useCallback(() => {
    return state.recipes.filter(recipe => {
      const { search, seasons, bases, cuisines, tags, difficulties } = state.filters
      
      if (search && !recipe.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      
      if (seasons.length > 0 && seasons.length < 4) {
        const recipeSeasons = recipe.season || []
        const hasMatchingSeason = seasons.some(s => recipeSeasons.includes(s))
        if (!hasMatchingSeason) return false
      }
      
      if (bases.length > 0 && !bases.includes(recipe.base_id)) {
        return false
      }
      
      if (cuisines.length > 0 && !cuisines.includes(recipe.cuisine_id)) {
        return false
      }
      
      if (tags.length > 0) {
        const recipeTagIds = recipe.tags?.map(t => t.id) || []
        if (!tags.some(t => recipeTagIds.includes(t))) {
          return false
        }
      }
      
      if (difficulties.length > 0 && !difficulties.includes(recipe.difficulty)) {
        return false
      }
      
      return true
    })
  }, [state.recipes, state.filters])
  
  const value = {
    ...state,
    t,
    dispatch,
    signIn,
    signUp,
    signOut,
    createHousehold,
    inviteToHousehold,
    acceptInvite,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addTag,
    updateTag,
    deleteTag,
    addBase,
    updateBase,
    deleteBase,
    addMealPlan,
    deleteMealPlan,
    loadMealPlansForRange,
    setLanguage,
    setPage,
    setFilters,
    clearFilters,
    getFilteredRecipes,
    loadUserData,
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}