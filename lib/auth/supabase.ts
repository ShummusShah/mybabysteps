import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Simple memory storage for Expo Go
const memoryStorage = {
  data: {} as Record<string, string>,

  getItem: (key: string) => {
    return Promise.resolve(memoryStorage.data[key] || null);
  },

  setItem: (key: string, value: string) => {
    memoryStorage.data[key] = value;
    return Promise.resolve();
  },

  removeItem: (key: string) => {
    delete memoryStorage.data[key];
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: memoryStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
