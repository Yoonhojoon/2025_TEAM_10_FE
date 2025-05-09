
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wykbkrwtflqsndnqdygu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5a2Jrcnd0Zmxxc25kbnFkeWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMDEyODUsImV4cCI6MjA1ODg3NzI4NX0.PCH_nIvow6DyC2hSarcxLNAxJF0PVlbl4DKrhWvt7LI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true
  },
  global: {
    fetch: (url: RequestInfo | URL, options?: RequestInit) => fetch(url, options)
  }
});
