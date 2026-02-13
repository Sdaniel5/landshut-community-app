import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://xydpshxaajsijqjjhasb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZHBzaHhhYWpzaWpxampoYXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODkzMzksImV4cCI6MjA4NjU2NTMzOX0.hW2fwRP19lWkGn5L0hDKLQXRKrl3iZn8ex2Mxq03nug';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
