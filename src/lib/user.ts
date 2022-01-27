import { supabase } from "./supabase"

export const USERS_TABLE = "users"

export const LANGUAGES = ["ENGLISH", "RUSSIAN"] as const

export type Language = typeof LANGUAGES[number]

export const TIMEZONES = [
  "America/New_York",
  "Asia/Almaty",
  "Asia/Dubai",
  "Asia/Tashkent",
  "Europe/London",
  "Europe/Moscow",
] as const

export type Timezone = typeof TIMEZONES[number]

export interface User {
  id: number
  created_at: string
  language: Language
  timezone: Timezone
  data: {
    isLanguageSetup: boolean
    isTimezoneSetup: boolean
  }
}

const cache = new Map<number, User>()

// Search for user data in cache, if not found,
// get user from the database.
export async function getUser(id: number) {
  if (cache.has(id)) {
    return cache.get(id)!
  }

  const { data, error } = await supabase
    .from<User>(USERS_TABLE)
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error(error)
    throw error
  }

  if (data) {
    cache.set(id, data)
  }

  return data
}

export async function createUser(data: User) {
  const { data: result, error } = await supabase
    .from<User>(USERS_TABLE)
    .insert(data)
    .single()

  if (error) {
    console.error(error)
    throw error
  }

  if (result) {
    cache.set(data.id, result)
  }

  return result
}

export async function updateUser(id: number, data: Partial<Omit<User, "id">>) {
  const { data: result, error } = await supabase
    .from<User>(USERS_TABLE)
    .update(data)
    .eq("id", id)

  if (error) {
    console.error(error)
    throw error
  }

  if (result) {
    const user = cache.get(id)
    cache.set(id, { ...user, ...data } as User)
  }

  return result
}
