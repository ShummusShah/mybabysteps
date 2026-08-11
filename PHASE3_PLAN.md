# Phase 3 Implementation Plan - MyBabySteps

## Overview
Phase 3 adds advanced features for analytics, sharing, milestones, photos, and settings.

## Feature Build Order

### 1. Dashboard Enhancements (1-2 hours)
**Goal:** Enhance existing dashboard with better metrics and trends

**Changes:**
- Update tracking cards to show trends (↑↓ indicators)
- Add weekly totals widget
- Add "Today's Goals" section
- Enhanced metric calculations
- Quick action buttons

**Database:** No changes needed (uses existing data)
**Files to Create/Update:**
- `app/(tabs)/index.tsx` - enhance dashboard
- `components/tracking/EnhancedCard.tsx` - new card component
- `hooks/useDashboard.ts` - add trend calculations

### 2. Insights & Analytics (2-3 hours)
**Goal:** Show data trends and patterns with charts

**Changes:**
- Weekly charts (feed frequency, sleep duration, nappy count)
- Monthly trends
- Average metrics
- Peak times analysis
- Export data option

**Database:** No changes needed
**Files to Create/Update:**
- `app/(tabs)/insights.tsx` - new analytics screen (add to tabs)
- `components/charts/LineChart.tsx` - trend visualization
- `components/charts/BarChart.tsx` - comparison visualization
- `hooks/useAnalytics.ts` - analytics calculations

### 3. Settings & Preferences (1 hour)
**Goal:** User customization and account settings

**Changes:**
- Edit baby profile
- Unit preferences (kg/lb, ml/oz, C/F)
- Time format, week start
- Notification settings
- Data management (export, delete)
- App info

**Database:** Update profiles table schema (birth_sex, avatar)
**Files to Create/Update:**
- `app/(tabs)/settings/index.tsx` - new settings screen
- `app/(tabs)/settings/baby.tsx` - edit baby profile
- `app/(tabs)/settings/preferences.tsx` - app preferences
- Update Zustand store for new preferences

### 4. Milestones & Photos (2-3 hours)
**Goal:** Track milestones and photo gallery

**Database Changes:**
- Create `milestones` table (id, baby_id, title, date, description, created_at)
- Create `photos` table (id, baby_id, photo_url, caption, date, created_at)

**Files to Create/Update:**
- `app/milestones/index.tsx` - milestone list
- `app/milestones/add.tsx` - create milestone
- `app/milestones/[id].tsx` - milestone detail
- `app/photos/index.tsx` - photo gallery
- `app/photos/add.tsx` - upload photo
- `hooks/useMilestones.ts` - milestone CRUD
- `hooks/usePhotos.ts` - photo CRUD

### 5. Caregiver Sharing (3-4 hours) - MOST COMPLEX
**Goal:** Multi-user household access and collaboration

**Database Changes:**
- Update `household_members` RLS policies
- Ensure proper role-based access

**Features:**
- Invite caregiver via email
- Accept/decline invitations
- View household members
- Remove members
- Role management (owner, caregiver, view-only)
- Activity feed (who logged what)

**Files to Create/Update:**
- `app/household/members.tsx` - manage members
- `app/household/invite.tsx` - invite caregiver
- `app/household/pending.tsx` - pending invitations
- `hooks/useHousehold.ts` - household member CRUD
- Update RLS policies in Supabase

---

## Implementation Strategy

1. **Start with Dashboard Enhancements** - quick wins, improves UX immediately
2. **Follow with Analytics** - builds on dashboard knowledge
3. **Add Settings** - important foundation for customization
4. **Implement Milestones & Photos** - new tracking capability
5. **Complete with Caregiver Sharing** - most complex, do last

## Estimated Total Time: 10-15 hours

## Commit Strategy
- One commit per feature
- Use conventional commits: `feat:`, `fix:`, `refactor:`

## Testing
- Manual testing in simulator for each feature
- Test data validation
- Test database queries
- Test RLS policies (for sharing feature)

---

## Start Date: 2026-08-11
## Current Status: Ready to begin Phase 3
