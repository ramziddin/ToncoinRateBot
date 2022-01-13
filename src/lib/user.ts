import { supabase } from "./supabase"

export const USERS_TABLE = "users"

export const LANGUAGES = ["ENGLISH", "RUSSIAN"] as const

export type Language = typeof LANGUAGES[number]

export interface User {
  id: number
  created_at: string
  language: Language
}

const cache = new Map<number, User>()

export async function getUser(id: number) {
  if (cache.has(id)) {
    return cache.get(id)!
  }

  const { data, error } = await supabase
    .from<User>(USERS_TABLE)
    .select("*")
    .single()

  if (error) {
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
    throw error
  }

  if (result) {
    const user = cache.get(id)
    cache.set(id, { ...user, ...data } as User)
  }

  return result
}
