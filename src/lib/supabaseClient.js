import { createClient } from '@supabase/supabase-js';

// Public anon key and project URL are safe to use in frontend
export const SUPABASE_URL = 'https://ssdzalxixubdotkebeyx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHphbHhpeHViZG90a2ViZXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Mzg1MjAsImV4cCI6MjA4MDExNDUyMH0.dK4IPZHH7VHNrmTdA0kcnFH-plw2nOplYn4sMClWkqM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
