import { createClient } from '@supabase/supabase-js'

// Anon key is intentionally public — RLS policies enforce per-user data isolation.
export const supabase = createClient(
  'https://zkpntmklqesdrtyzbgym.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcG50bWtscWVzZHJ0eXpiZ3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDI5NzgsImV4cCI6MjA5NzYxODk3OH0.30gDn-DVhtHhhSUwCvn7pFxQGqPDur-gzIPsnQadYy8'
)
