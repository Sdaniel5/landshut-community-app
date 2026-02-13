# Landshut App v2 - Implementation Plan

## Architecture Overview

### File Structure (New)
```
src/
├── contexts/
│   ├── ThemeContext.js          # Dark/Light mode + persistence
│   └── AuthContext.js            # User auth state management
├── components/
│   ├── GlassCard.js              # Reusable glassmorphism card
│   ├── AnimatedTabBar.js         # Custom animated navbar
│   ├── LicensePlateDetector.js   # Regex + warning modal
│   ├── FAQAccordion.js           # Collapsible FAQ
│   ├── ProfileCard.js            # User profile display
│   ├── ReportCard.js             # Enhanced report card with karma
│   └── SearchBar.js              # Search component
├── screens/
│   ├── AuthScreen.js             # Login/Register
│   ├── ProfileScreen.js          # User profile + edit
│   ├── FAQScreen.js              # FAQ section
│   ├── PublicProfileScreen.js    # View other users
│   └── (existing screens)
├── hooks/
│   ├── useKarma.js               # Karma/reputation logic
│   ├── useOfflineSync.js         # Offline mode + sync
│   └── useReportFilters.js       # Map filter logic
└── utils/
    ├── licensePlateRegex.js      # German plate validation
    ├── shareUtils.js             # Social sharing
    └── animations.js             # Reanimated presets
```

## Features Selected (5 Additional)

1. **Karma/Reputation System** - Gamification + quality control
2. **Map Filters** - Toggle report types for better UX
3. **Report History** - User's past submissions
4. **Share Functionality** - WhatsApp/Social sharing
5. **Offline Mode** - Cache + sync for reliability

## Implementation Phases

### Phase 1: Foundation (Dependencies + Theme)
- [ ] Install NativeWind, Reanimated 3, Zustand
- [ ] Create ThemeContext with AsyncStorage persistence
- [ ] Build GlassCard component
- [ ] Setup Reanimated for transitions

### Phase 2: UI Redesign
- [ ] Redesign navbar with glassmorphism + animations
- [ ] Update all screens with new theme
- [ ] Add page transition animations
- [ ] Implement micro-interactions

### Phase 3: Core Features
- [ ] License plate detector + warning modal
- [ ] FAQ section with search
- [ ] User auth flow (Supabase)
- [ ] Profile system (view/edit)

### Phase 4: Additional Features
- [ ] Karma system (upvotes + reputation)
- [ ] Map filters (type toggles)
- [ ] Report history page
- [ ] Share functionality
- [ ] Offline mode + sync

### Phase 5: Polish & Testing
- [ ] Smooth all animations
- [ ] Test dark/light mode transitions
- [ ] Mobile responsiveness checks
- [ ] Performance optimization
- [ ] Update README

## Supabase Schema Requirements

### Tables to Create/Modify

```sql
-- user_profiles (new)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  karma INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- reports (modify - add user_id, license_plate)
ALTER TABLE reports
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN license_plate TEXT,
ADD COLUMN karma INT DEFAULT 0,
ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- report_votes (new - track who voted)
CREATE TABLE report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

-- report_verifications (new - community verification)
CREATE TABLE report_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);
```

### Storage Buckets
- `avatars` - Profile pictures (public read, authenticated write)

## Tech Stack Confirmation
- ✅ React Native (Expo SDK 51)
- ✅ Supabase (configured)
- 🔄 NativeWind (Tailwind CSS for RN)
- 🔄 Reanimated 3
- 🔄 Zustand (lightweight state)
- 🔄 Moti (declarative animations)

## Success Metrics
- [ ] Dark/Light mode toggle working + persisted
- [ ] Glassmorphism navbar with smooth animations
- [ ] License plate detector warns on "Zivil"
- [ ] FAQ searchable + helpful
- [ ] User auth + profiles functional
- [ ] Karma system working
- [ ] Map filters toggle report types
- [ ] Share button works (WhatsApp tested)
- [ ] Offline mode caches reports
- [ ] All animations smooth (60fps)

---

**Next Steps**: Install dependencies and create base contexts.
