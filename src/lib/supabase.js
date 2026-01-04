import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// ============================================
// AUTH
// ============================================

export async function signUp(email, password, displayName) {
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

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription
}

// ============================================
// PROFILE
// ============================================

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================
// TAGS
// ============================================

export async function getTags(userId) {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createTag(userId, tag) {
  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, ...tag })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTag(tagId, updates) {
  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', tagId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTag(tagId) {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)
  if (error) throw error
}

// ============================================
// BASES
// ============================================

export async function getBases(userId) {
  const { data, error } = await supabase
    .from('bases')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createBase(userId, base) {
  const { data, error } = await supabase
    .from('bases')
    .insert({ user_id: userId, ...base })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBase(baseId, updates) {
  const { data, error } = await supabase
    .from('bases')
    .update(updates)
    .eq('id', baseId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBase(baseId) {
  const { error } = await supabase
    .from('bases')
    .delete()
    .eq('id', baseId)
  if (error) throw error
}

// ============================================
// CUISINES
// ============================================

export async function getCuisines() {
  const { data, error } = await supabase
    .from('cuisines')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

// ============================================
// RECIPES
// ============================================

export async function getRecipes(userId) {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      base:bases(*),
      cuisine:cuisines(*),
      recipe_tags(tag_id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createRecipe(userId, recipe, tagIds = []) {
  // Insert recipe
  const { data: newRecipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({ user_id: userId, ...recipe })
    .select()
    .single()
  if (recipeError) throw recipeError

  // Insert tags if any
  if (tagIds.length > 0) {
    const tagLinks = tagIds.map(tagId => ({
      recipe_id: newRecipe.id,
      tag_id: tagId
    }))
    const { error: tagsError } = await supabase
      .from('recipe_tags')
      .insert(tagLinks)
    if (tagsError) throw tagsError
  }

  return newRecipe
}

export async function updateRecipe(recipeId, recipe, tagIds = []) {
  // Update recipe
  const { data: updatedRecipe, error: recipeError } = await supabase
    .from('recipes')
    .update(recipe)
    .eq('id', recipeId)
    .select()
    .single()
  if (recipeError) throw recipeError

  // Delete existing tags
  const { error: deleteError } = await supabase
    .from('recipe_tags')
    .delete()
    .eq('recipe_id', recipeId)
  if (deleteError) throw deleteError

  // Insert new tags
  if (tagIds.length > 0) {
    const tagLinks = tagIds.map(tagId => ({
      recipe_id: recipeId,
      tag_id: tagId
    }))
    const { error: tagsError } = await supabase
      .from('recipe_tags')
      .insert(tagLinks)
    if (tagsError) throw tagsError
  }

  return updatedRecipe
}

export async function deleteRecipe(recipeId) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)
  if (error) throw error
}

// ============================================
// MEAL PLANS
// ============================================

export async function getMealPlans(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      *,
      recipe:recipes(
        *,
        recipe_tags(tag_id)
      )
    `)
    .eq('user_id', userId)
    .gte('planned_date', startDate)
    .lte('planned_date', endDate)
    .order('planned_date', { ascending: true })
  if (error) throw error
  return data
}

export async function createMealPlan(userId, recipeId, plannedDate) {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      user_id: userId,
      recipe_id: recipeId,
      planned_date: plannedDate
    })
    .select(`
      *,
      recipe:recipes(
        *,
        recipe_tags(tag_id)
      )
    `)
    .single()
  if (error) throw error
  return data
}

export async function deleteMealPlan(mealPlanId) {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', mealPlanId)
  if (error) throw error
}