/**
 * Supabase configuration — The National School & College (TNS)
 *
 * HOW TO CONNECT (one-time setup):
 *   1. Go to https://supabase.com and open your project.
 *   2. On the left sidebar open  Settings -> API (or Project Settings -> API).
 *   3. Copy the "Project URL" and the public "anon / publishable" key below.
 *   4. Paste them into the quotes on this file and save.
 *
 * SECURITY:
 *   - The anon key is PUBLIC and safe to expose in a website (it is meant
 *     to be shipped to browsers). Row Level Security (see supabase/schema.sql)
 *     is what actually protects your data.
 *   - NEVER paste the "service_role" / secret key here. Anyone who finds it
 *     can read and delete everything in your database.
 */
window.TNS_SUPABASE = {
  url: 'https://agidduamhstdmnqplehf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnaWRkdWFtaHN0ZG1ucXBsZWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2Mzc1NDMsImV4cCI6MjEwMjIxMzU0M30.TH8ZEgDM8Vs3qceKAJesMiCiP4U8scKAyxzxgvQyU5g'
};
