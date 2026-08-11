# Getting Started with MyBabySteps

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd mybabysteps
npm install
```

### 2. Set up Environment Variables
Create `.env` file (already included as example):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your-ios-key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your-android-key
```

For **development with placeholder data**, the .env file is already set up. The app will run without Supabase initially (using mock authentication).

### 3. Start the App
```bash
npm run ios              # iOS Simulator
npm run android         # Android Emulator
npm run web             # Web browser
```

### 4. Navigate the App
- **First time**: Welcome screen → Signup → Onboarding flow → Home dashboard
- **Onboarding steps**:
  1. Baby details (name, date of birth, photo)
  2. Unit preferences (weight, milk, temperature)
  3. Tracking module selection (which modules to use)
  4. Ready! Dashboard shows

## Verify Everything Works

```bash
# Type checking (should show no errors)
npx tsc --noEmit

# Linting
npx expo lint
```

## Project Structure Quick Reference

```
app/                     # Screens and routing
├── (tabs)/             # Main app tabs
├── auth/               # Login/signup screens
├── onboarding/         # Baby setup flow
└── [feature]/          # Feed, sleep, nappy, etc.

components/            # Reusable UI components
├── ui/                # Buttons, headers, containers
└── tracking/          # Tracking-specific components

hooks/                 # Custom React hooks
├── useAuth.ts         # Authentication
├── useBaby.ts         # Baby management
└── useDashboard.ts    # Dashboard data

stores/                # Global state (Zustand)
lib/                   # Utilities
├── utils/            # Date, units, formatting
├── auth/             # Supabase setup
└── calculations/     # Data aggregations

types/                # TypeScript type definitions
constants/            # Theme, colors, strings
```

## Understanding the Screens

### Authentication Flow
1. **Welcome** (`app/auth/welcome.tsx`) - Intro with signup/login buttons
2. **Signup** (`app/auth/signup.tsx`) - Email/password registration
3. **Login** (`app/auth/login.tsx`) - Email/password login
4. **Forgot Password** (`app/auth/forgot-password.tsx`) - Password reset

### Onboarding Flow
1. **Welcome** (`app/onboarding/welcome.tsx`) - Intro
2. **Baby Details** (`app/onboarding/baby-details.tsx`) - Baby info
3. **Units** (`app/onboarding/units.tsx`) - Measurement preferences
4. **Tracking Modules** (`app/onboarding/tracking-preferences.tsx`) - What to track
5. **Complete** (`app/onboarding/complete.tsx`) - Done!

### Main App (After Onboarding)
1. **Home** (`app/(tabs)/index.tsx`) - Dashboard with tracking cards
2. **History** (`app/(tabs)/history.tsx`) - Timeline of all events
3. **Quick Log** (`app/(tabs)/quick-log.tsx`) - Fast entry modal
4. **Insights** (`app/(tabs)/insights.tsx`) - Analytics dashboard
5. **Profile** (`app/(tabs)/profile.tsx`) - User settings

## Key Features Implemented

### ✅ Complete
- User authentication (email/password)
- Baby profile creation
- Home dashboard with tracking cards
- Quick log modal with module selection
- Unit preference selection
- Onboarding flow
- Navigation structure
- Form validation (React Hook Form + Zod)
- State management (Zustand + React Query)

### ⏳ Ready to Implement (Phase 2)
- **Feed Tracking**
  - Breastfeeding with timer and side selection
  - Bottle feeding with volume
  - Pumping session tracking
  
- **Sleep Tracking**
  - Active sleep timer (persists across app close)
  - Wake up logging
  - Sleep type selection (nap vs night)
  
- **Nappy Logging**
  - Quick 2-tap logging
  - Type, color, consistency tracking
  
- **Edit & Delete**
  - All logs can be edited
  - Delete with confirmation

## Customization Points

### Theme Colors
Edit `constants/theme.ts`:
```typescript
export const theme = {
  colors: {
    teal: '#21B6AD',        // Primary brand color
    mint: '#DDF7F3',        // Feeding card
    lavender: '#EEE8FF',    // Sleep card
    // ... more colors
  }
}
```

### Tracking Modules
Edit `stores/useStore.ts` to add/remove modules:
```typescript
quickLogModules: [
  { type: 'feed', enabled: true, order: 0 },
  { type: 'sleep', enabled: true, order: 1 },
  // ...
]
```

### Database Schema
Ready in Supabase. Set up by:
1. Creating a Supabase project
2. Creating tables from `supabase/migrations/` SQL files
3. Enabling Row-Level Security

## Development Workflow

### Adding a New Screen
1. Create folder in `app/[feature]/`
2. Create layout file (`_layout.tsx`)
3. Create screen components
4. Add navigation in parent layout

### Adding a New Component
1. Create in `components/[category]/`
2. Export from `index.tsx` if needed
3. Import in screens as `import { Component } from '@/components/...'`

### Adding State to Global Store
1. Add to `stores/useStore.ts`
2. Use hook in components: `const { state, setState } = useStore()`

### Adding API Calls
1. Create hook in `hooks/`
2. Use React Query for data fetching
3. Use Supabase client from `lib/auth/supabase.ts`

## Debugging

### See Console Logs
```bash
# Watch logs while app is running
npm run ios -- --clear

# Or use Expo dev tools (press 'j' in terminal)
```

### Type Checking
```bash
npx tsc --noEmit
```

### Common Issues

**AsyncStorage not available in Expo Go**
- Already handled! Using memory storage fallback
- Data persists during session but not between app restarts

**Icons not displaying**
- Make sure icon name is valid Material Community icon
- Update in constants or component props

**Routes not recognized**
- Ensure file is in `app/` directory
- Restart dev server after adding new routes

## Next Steps

### To Continue Development:

1. **Complete Phase 2** (6-8 hours)
   - Implement feed tracking (breast, bottle, pump)
   - Implement sleep tracking with timers
   - Implement nappy quick logging
   - Build history timeline
   - Add edit/delete functionality

2. **Complete Phase 3** (4-6 hours)
   - Build remaining tracking modules
   - Add growth chart
   - Add milestones tracking
   - Add photo memories

3. **Complete Phase 4** (4-6 hours)
   - Build insights/analytics screen
   - Add charts using react-native-svg-charts
   - Implement data aggregation

4. **Complete Phase 5** (3-4 hours)
   - Add subscription gating
   - Implement caregiver sharing
   - Add PDF export

5. **Complete Phase 6** (4-6 hours)
   - Add offline support
   - Optimize performance
   - Improve accessibility
   - Add testing

## Testing the Current Version

The app is fully functional at this stage:
1. ✅ Create account and sign in
2. ✅ Add baby during onboarding
3. ✅ Select tracking preferences
4. ✅ See dashboard with empty tracking cards
5. ✅ Open Quick Log modal
6. ✅ Navigate between tabs

## Support & Documentation

- **Type definitions**: Check `types/index.ts` for all data models
- **Component props**: JSDoc comments in component files
- **Utility functions**: Check `lib/utils/` for usage examples
- **Design system**: Refer to `constants/theme.ts`

## Deployment

When ready to deploy:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --platform ios --auto-submit  # iOS
eas build --platform android            # Android
```

---

**You're ready to build!** Start with implementing the feed tracking module for Phase 2. All the infrastructure is in place.
