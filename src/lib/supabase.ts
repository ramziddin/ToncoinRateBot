import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const { SUPABASE_URL, SUPABASE_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY")
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
