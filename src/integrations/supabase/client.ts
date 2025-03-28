
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nobccgrcuqvebazycvnp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYmNjZ3JjdXF2ZWJhenljdm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NTcwMjIsImV4cCI6MjA1ODUzMzAyMn0.XW2Wj93uTVdZn-7HDy3SBk5vR_knWt6kZdY9Wg5Is-E";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
