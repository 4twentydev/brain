import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types";

export function createClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export type SupabaseClient = ReturnType<typeof createClient>;
