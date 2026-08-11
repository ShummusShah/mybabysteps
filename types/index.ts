export type Baby = {
  id: string;
  household_id: string;
  name: string;
  date_of_birth: string;
  sex: 'male' | 'female' | 'prefer_not_to_say';
  avatar_url?: string;
  birth_weight?: number;
  birth_length?: number;
  created_at: string;
  updated_at: string;
};

export type FeedLog = {
  id: string;
  baby_id: string;
  created_by: string;
  feed_type: 'breast' | 'bottle' | 'pump';
  milk_type?: 'formula' | 'expressed' | 'mixed' | 'other';
  amount_ml?: number;
  left_duration_seconds?: number;
  right_duration_seconds?: number;
  start_time: string;
  end_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type SleepLog = {
  id: string;
  baby_id: string;
  created_by: string;
  sleep_type: 'nap' | 'night';
  start_time: string;
  end_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type NappyLog = {
  id: string;
  baby_id: string;
  created_by: string;
  type: 'wet' | 'dirty' | 'both' | 'dry';
  colour?: 'yellow' | 'brown' | 'green' | 'black' | 'other';
  consistency?: 'loose' | 'soft' | 'formed' | 'hard' | 'other';
  logged_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type PumpLog = {
  id: string;
  baby_id: string;
  created_by: string;
  left_amount_ml: number;
  right_amount_ml: number;
  start_time: string;
  end_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type TummyTimeLog = {
  id: string;
  baby_id: string;
  created_by: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type MedicineLog = {
  id: string;
  baby_id: string;
  created_by: string;
  medicine_name: string;
  dose: number;
  dose_unit: 'ml' | 'mg' | 'drops' | 'tablet' | 'other';
  logged_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type TemperatureLog = {
  id: string;
  baby_id: string;
  created_by: string;
  temperature_celsius: number;
  measurement_location?: 'axillary' | 'oral' | 'ear' | 'rectal' | 'forehead' | 'other';
  logged_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type GrowthLog = {
  id: string;
  baby_id: string;
  created_by: string;
  type: 'weight' | 'length' | 'head';
  value_metric: number;
  logged_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: string;
  baby_id: string;
  created_by: string;
  title: string;
  is_custom: boolean;
  achieved: boolean;
  achieved_at?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
};

export type PhotoLog = {
  id: string;
  baby_id: string;
  created_by: string;
  photo_url: string;
  thumbnail_url?: string;
  caption?: string;
  category?: 'everyday' | 'milestone' | 'growth' | 'other';
  logged_at: string;
  created_at: string;
  updated_at: string;
};

export type TimelineItem = {
  id: string;
  type: 'feed' | 'sleep' | 'nappy' | 'pump' | 'tummy' | 'medicine' | 'temperature' | 'growth' | 'milestone' | 'photo';
  timestamp: string;
  title: string;
  subtitle?: string;
  icon: string;
  colour: string;
  rawData: FeedLog | SleepLog | NappyLog | PumpLog | TummyTimeLog | MedicineLog | TemperatureLog | GrowthLog | Milestone | PhotoLog;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  weight_unit: 'kg' | 'lb';
  milk_unit: 'ml' | 'fl_oz';
  temperature_unit: 'celsius' | 'fahrenheit';
  tracking_modules: {
    feeding: boolean;
    sleep: boolean;
    nappies: boolean;
    pumping: boolean;
    tummy_time: boolean;
    medicine: boolean;
    temperature: boolean;
    growth: boolean;
    milestones: boolean;
    photos: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  start_of_week: 'monday' | 'sunday';
  time_format: '12h' | '24h';
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Household = {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
};

export type HouseholdMember = {
  id: string;
  household_id: string;
  user_id: string;
  role: 'owner' | 'parent' | 'caregiver' | 'viewer';
  display_label?: string;
  created_at: string;
};

export type Reminder = {
  id: string;
  baby_id: string;
  created_by: string;
  type: 'feed' | 'medicine' | 'tummy_time' | 'bedtime' | 'custom';
  title: string;
  schedule_type: 'specific_time' | 'interval';
  scheduled_time?: string;
  interval_minutes?: number;
  enabled: boolean;
  notification_identifier?: string;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: 'free' | 'monthly' | 'annual';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
};
