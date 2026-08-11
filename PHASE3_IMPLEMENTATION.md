# Phase 3 Implementation - Matching Figma Design

## Figma Design Reference
- File: MyBabySteps — Mobile App UI
- Current Status: All screens designed and ready for implementation

## Phase 3 Features to Build (Matching Figma)

### 1. Dashboard Enhancements (Home Screen - Design 04)
**Current Status:** Started (trends hook + enhanced card)
**Design Requirements:**
- Display baby name prominently (e.g., "Mum 👶 Leo is 6 weeks, 3 days old")
- Show 3 main tracking cards (Feeding, Sleep, Nappies) with:
  - Current status/metric
  - Quick stats (Today, Yesterday, This Week, Last Week)
  - Trend indicators (↑↓=)
  - Quick action button (tap to add)
- Quick Log section with recent entries
- Floating + button for quick log

**Files to Create/Update:**
- `app/(tabs)/index.tsx` - Integrate EnhancedMetricCard, add baby name display
- Already created: `useDashboardTrends.ts`, `EnhancedMetricCard.tsx`

### 2. Insights & Analytics (Screens 17-18)
**Design Requirements:**
- Weekly trends with line/bar charts
- Feeding frequency trends
- Sleep duration trends
- Nappy count trends
- Average metrics
- Peak times visualization

**Files to Create:**
- `app/(tabs)/insights.tsx` - Add to tabs layout
- `components/charts/LineChart.tsx` - Trend visualization
- `components/charts/BarChart.tsx` - Comparison charts
- `hooks/useAnalytics.ts` - Analytics calculations

### 3. Settings & Preferences (Design 03 + extended)
**Design Requirements:**
- Tracking preferences (enable/disable trackers)
- Edit baby profile (name, DOB, sex, avatar)
- Unit preferences (kg/lb, ml/oz, C/F)
- Time format (12h/24h)
- Notification settings
- Data management (export, delete)

**Files to Create:**
- `app/(tabs)/settings/index.tsx` - Settings home
- `app/(tabs)/settings/baby.tsx` - Edit baby profile
- `app/(tabs)/settings/preferences.tsx` - Unit/time preferences
- Update Zustand store with new preferences

### 4. Milestones & Photos (Screens 15, 19)
**Database Changes Needed:**
```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY,
  baby_id UUID REFERENCES babies,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photos (
  id UUID PRIMARY KEY,
  baby_id UUID REFERENCES babies,
  photo_url TEXT NOT NULL,
  caption TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Design Requirements:**
- Milestone list view with dates
- Create/edit milestone modal
- Photo gallery with grid layout
- Photo upload capability
- Photo caption editing

**Files to Create:**
- `app/milestones/index.tsx` - Milestone list
- `app/milestones/add.tsx` - Create milestone
- `app/milestones/[id].tsx` - Milestone detail
- `app/photos/index.tsx` - Photo gallery
- `app/photos/add.tsx` - Upload photo
- `hooks/useMilestones.ts` - Milestone CRUD
- `hooks/usePhotos.ts` - Photo CRUD

### 5. Caregiver Sharing (Advanced)
**Database Considerations:**
- Update household_members RLS policies
- Support invite/accept flow
- Role-based access (owner, caregiver, view-only)

**Design Requirements:**
- View household members
- Invite caregiver via email
- Accept/decline invitations
- Remove members
- Activity log (who logged what)

**Files to Create:**
- `app/household/members.tsx` - Manage members
- `app/household/invite.tsx` - Invite caregiver
- `app/household/pending.tsx` - Pending invites
- `hooks/useHousehold.ts` - Household CRUD
- Update RLS policies

## Build Order
1. ✅ Dashboard Trends Hook + Enhanced Card
2. → Complete Home Dashboard Integration
3. → Create Insights/Analytics Screen
4. → Create Settings Screens
5. → Create Milestones & Photos
6. → Create Caregiver Sharing

## Estimated Time
- Dashboard Integration: 1 hour
- Insights & Analytics: 2-3 hours
- Settings: 1 hour
- Milestones & Photos: 2-3 hours
- Caregiver Sharing: 3-4 hours
**Total: ~10-12 hours**

## Status
- Phase 1 & 2: ✅ COMPLETE
- Phase 3: 🔄 IN PROGRESS
