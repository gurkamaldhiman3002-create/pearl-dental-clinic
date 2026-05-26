import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAuthStorageKey = `sb-${
  new URL(supabaseUrl).hostname.split(".")[0]
}-auth-token`;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
