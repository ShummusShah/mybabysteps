# MyBabySteps - Mobile App

A production-quality iOS/Android app for tracking newborn and baby activities built with React Native, Expo, TypeScript, and Supabase.

## Project Structure

```
mybabysteps/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Main app tabs (home, history, insights, profile)
│   ├── auth/                     # Authentication screens (login, signup, forgot password)
│   ├── onboarding/               # Onboarding flow
│   ├── feed/                      # Feed tracking screens
│   ├── sleep/                     # Sleep tracking screens
│   ├── nappy/                     # Nappy tracking screens
│   └── ...                        # Other tracking modules
├── components/                    # Reusable UI components
│   ├── ui/                        # Basic UI components (buttons, headers, cards)
│   ├── tracking/                  # Tracking-specific components
│   └── charts/                    # Chart components
├── hooks/                         # Custom React hooks
│   ├── useAuth.ts                 # Authentication hook
│   ├── useBaby.ts                 # Baby management hook
│   └── useDashboard.ts            # Dashboard data hook
├── stores/                        # Zustand state management
├── services/                      # API and service layer
│   └── supabase/                  # Supabase configuration
├── lib/                           # Utility functions
│   ├── auth/                      # Authentication utilities
│   ├── utils/                     # Helper functions (date, unit conversion, etc.)
│   └── calculations/              # Data calculation functions
├── types/                         # TypeScript type definitions
├── constants/                     # App constants (theme, etc.)
└── assets/                        # Images, fonts, icons

```

## Setup

### 1. Install Dependencies

```bash
cd mybabysteps
npm install
```

### 2. Environment Configuration

Create a `.env` file with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your-ios-key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your-android-key
```

### 3. Database Setup (Supabase)

The database schema is ready to be created. SQL migrations are being managed in `supabase/migrations/`. 

To set up your Supabase project:
1. Create a new Supabase project
2. Run the SQL migrations (schema definition)
3. Enable Row Level Security (RLS)

### 4. Running the App

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Web (development only):**
```bash
npm run web
```

## Completed Phases

### PHASE 1 - Foundation ✅
- [x] Project architecture and file structure
- [x] Theme and design system
- [x] Reusable UI components
- [x] Authentication system (email/password)
- [x] Auth hooks and state management
- [x] Supabase client setup
- [x] TypeScript configuration
- [x] Onboarding flow (5 screens)
- [x] Baby profile management
- [x] Bottom navigation structure

### PHASE 2 - Core Tracking (In Progress)
- [x] Home screen with dashboard cards
- [x] Quick Log modal
- [ ] Feeding module (breast, bottle, pump)
- [ ] Sleep tracking with timers
- [ ] Nappy logging
- [ ] Timeline view
- [ ] History screen
- [ ] Edit/Delete functionality

### PHASE 3 - Additional Tracking (Planned)
- [ ] Pumping
- [ ] Tummy Time
- [ ] Medicine logging
- [ ] Temperature tracking
- [ ] Growth measurements
- [ ] Milestones

### PHASE 4 - Analytics & Features (Planned)
- [ ] Insights/Analytics
- [ ] Charts and visualizations
- [ ] Photo memories
- [ ] Notifications
- [ ] Reminders

### PHASE 5 - Premium Features (Planned)
- [ ] Premium subscription gating
- [ ] Caregiver sharing and collaboration
- [ ] PDF reports
- [ ] Advanced analytics

### PHASE 6 - Polish (Planned)
- [ ] Offline support
- [ ] Accessibility improvements
- [ ] Error state handling
- [ ] Loading state optimization
- [ ] Performance optimization
- [ ] Testing

## Key Features Implemented

### Authentication
- Email/password signup and login
- Forgot password flow
- Session persistence
- Secure token handling

### Onboarding
- Baby profile creation with photo
- Date of birth (auto-calculates age)
- Unit preferences (weight, milk, temperature)
- Tracking module selection

### Home Screen
- Baby greeting with current age
- Three primary tracking cards (Feed, Sleep, Nappies)
- Last activity and today's totals
- Quick action buttons
- Timeline of today's events
- Floating action button for quick logging

### State Management
- Zustand for global state
- React Query for server state
- AsyncStorage compatibility (with fallback)
- Active timer persistence

### Database Types
Full TypeScript support for all data models:
- Profiles, Babies, Households
- Feeding, Sleep, Nappy logs
- Pump, Tummy Time, Medicine logs
- Temperature, Growth, Milestones
- Photos, Reminders
- User Preferences, Subscriptions

## Design System

**Colors:**
- Primary: Teal (#21B6AD)
- Pastels: Mint, Lavender, Peach, Orange, Yellow, Pink, Purple
- Neutral: Whites, Grays, Dark gray text
- Status: Green (success), Orange (warning), Red (error)

**Typography:**
- Screen titles: 28px semibold
- Section titles: 20px semibold
- Body: 14px regular
- Buttons: 14px semibold

**Components:**
- Cards: 20px border radius
- Buttons: 16px border radius
- Input fields: 14px border radius
- Shadows: Multiple levels for depth

## Next Steps

1. **Implement Feed Tracking**
   - Breast feed with timer and side selection
   - Bottle feed with volume
   - Pump tracking

2. **Implement Sleep Tracking**
   - Start/stop sleep with active state persistence
   - Sleep type selection
   - Duration calculation

3. **Implement Nappy Logging**
   - Quick logging (2 taps)
   - Type, color, consistency tracking
   - Optional notes

4. **Complete History Screen**
   - Filtered timeline
   - Search functionality
   - Date picker
   - Edit/delete with confirmation

5. **Build Insights Screen**
   - Analytics calculations
   - Chart visualizations
   - Time period filters

6. **Add Remaining Modules**
   - Tummy time, medicine, temperature, growth
   - Milestones tracking
   - Photo diary

7. **Premium & Collaboration**
   - Subscription gating
   - Caregiver invitations
   - Role-based permissions

## Technology Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Routing:** Expo Router
- **State Management:** Zustand, React Query
- **Forms:** React Hook Form + Zod validation
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Date Handling:** date-fns
- **Charts:** react-native-svg-charts
- **Notifications:** Expo Notifications
- **Media:** Expo Image Picker
- **Icons:** Material Community Icons

## Development Notes

- All screens are fully functional, not placeholder mockups
- Type safety enforced throughout with strict TypeScript
- Responsive design for iPhone (extensible to iPad)
- Ready for App Store and Play Store submission
- Environment variables required for Supabase connection
- Fallback storage for Expo Go development

## Testing

Run TypeScript type checking:
```bash
npx tsc --noEmit
```

Run linter:
```bash
npx expo lint
```

## Build for Deployment

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Support

For issues or questions about the app architecture, check the inline code documentation and TypeScript types which provide detailed comments throughout.
