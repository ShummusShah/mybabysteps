import { create } from 'zustand';
import memoryStorage from 'expo-sqlite/kv-store';

interface QuickLogModule {
  type:
    | 'feed'
    | 'sleep'
    | 'nappy'
    | 'pump'
    | 'tummy'
    | 'medicine'
    | 'temperature'
    | 'growth'
    | 'milestone'
    | 'photo';
  enabled: boolean;
  order: number;
}

interface ActiveTimer {
  type: 'feed' | 'sleep' | 'tummy';
  startedAt: number;
  babyId: string;
  metadata?: Record<string, any>;
}

export interface Reminder {
  id: string;
  title: string;
  type: 'medicine' | 'feed' | 'sleep' | 'tummy' | 'other';
  hour: number;
  minute: number;
  repeat: 'daily' | 'once';
  enabled: boolean;
  notificationId: string | null;
}

interface StoreState {
  currentBabyId: string | null;
  setCurrentBabyId: (id: string) => void;

  activeTimer: ActiveTimer | null;
  setActiveTimer: (timer: ActiveTimer | null) => void;

  quickLogModules: QuickLogModule[];
  setQuickLogModules: (modules: QuickLogModule[]) => void;

  userPreferences: {
    weightUnit: 'kg' | 'lb';
    heightUnit: 'cm' | 'inches';
    milkUnit: 'ml' | 'fl_oz';
    temperatureUnit: 'celsius' | 'fahrenheit';
    theme: 'light' | 'dark' | 'system';
  };
  setUserPreferences: (prefs: Partial<StoreState['userPreferences']>) => void;

  lastFeedTime: number | null;
  setLastFeedTime: (time: number | null) => void;

  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;

  initializeFromStorage: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  currentBabyId: null,
  setCurrentBabyId: (id: string) => {
    memoryStorage.setItem('currentBabyId', id);
    set({ currentBabyId: id });
  },

  activeTimer: null,
  setActiveTimer: (timer: ActiveTimer | null) => {
    if (timer) {
      memoryStorage.setItem('activeTimer', JSON.stringify(timer));
    } else {
      memoryStorage.removeItem('activeTimer');
    }
    set({ activeTimer: timer });
  },

  quickLogModules: [
    { type: 'feed', enabled: true, order: 0 },
    { type: 'sleep', enabled: true, order: 1 },
    { type: 'nappy', enabled: true, order: 2 },
    { type: 'tummy', enabled: true, order: 3 },
    { type: 'pump', enabled: true, order: 4 },
    { type: 'medicine', enabled: true, order: 5 },
    { type: 'temperature', enabled: true, order: 6 },
    { type: 'growth', enabled: true, order: 7 },
    { type: 'milestone', enabled: true, order: 8 },
    { type: 'photo', enabled: true, order: 9 },
  ],
  setQuickLogModules: (modules: QuickLogModule[]) => {
    memoryStorage.setItem('quickLogModules', JSON.stringify(modules));
    set({ quickLogModules: modules });
  },

  userPreferences: {
    weightUnit: 'kg',
    heightUnit: 'cm',
    milkUnit: 'ml',
    temperatureUnit: 'celsius',
    theme: 'system',
  },
  setUserPreferences: (prefs: Partial<StoreState['userPreferences']>) => {
    set((state) => {
      const newPrefs = { ...state.userPreferences, ...prefs };
      memoryStorage.setItem('userPreferences', JSON.stringify(newPrefs));
      return { userPreferences: newPrefs };
    });
  },

  lastFeedTime: null,
  setLastFeedTime: (time: number | null) => {
    if (time) {
      memoryStorage.setItem('lastFeedTime', time.toString());
    } else {
      memoryStorage.removeItem('lastFeedTime');
    }
    set({ lastFeedTime: time });
  },

  reminders: [],
  setReminders: (reminders: Reminder[]) => {
    memoryStorage.setItem('reminders', JSON.stringify(reminders));
    set({ reminders });
  },

  initializeFromStorage: async () => {
    try {
      const [babyId, timerStr, modulesStr, prefsStr, feedTimeStr, remindersStr] = await Promise.all([
        memoryStorage.getItem('currentBabyId'),
        memoryStorage.getItem('activeTimer'),
        memoryStorage.getItem('quickLogModules'),
        memoryStorage.getItem('userPreferences'),
        memoryStorage.getItem('lastFeedTime'),
        memoryStorage.getItem('reminders'),
      ]);

      set({
        currentBabyId: babyId || null,
        activeTimer: timerStr ? JSON.parse(timerStr) : null,
        quickLogModules: modulesStr
          ? JSON.parse(modulesStr)
          : [
              { type: 'feed', enabled: true, order: 0 },
              { type: 'sleep', enabled: true, order: 1 },
              { type: 'nappy', enabled: true, order: 2 },
              { type: 'tummy', enabled: true, order: 3 },
              { type: 'pump', enabled: true, order: 4 },
              { type: 'medicine', enabled: true, order: 5 },
              { type: 'temperature', enabled: true, order: 6 },
              { type: 'growth', enabled: true, order: 7 },
              { type: 'milestone', enabled: true, order: 8 },
              { type: 'photo', enabled: true, order: 9 },
            ],
        userPreferences: prefsStr
          ? JSON.parse(prefsStr)
          : {
              weightUnit: 'kg',
              heightUnit: 'cm',
              milkUnit: 'ml',
              temperatureUnit: 'celsius',
              theme: 'system',
            },
        lastFeedTime: feedTimeStr ? parseInt(feedTimeStr) : null,
        reminders: remindersStr ? JSON.parse(remindersStr) : [],
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  },
}));
