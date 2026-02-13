# Changelog

All notable changes to the Landshut Community App will be documented in this file.

## [2.0.0] - 2026-02-13

### 🎨 Design Overhaul

#### Added
- **Glassmorphism UI** throughout the app with frosted glass effects
- **Dark/Light Mode Toggle** with smooth transitions and AsyncStorage persistence
- **Modern Theme System** using React Context with comprehensive color palette
- **Brutal Modern Navbar** with animated bottom tabs and glassmorphism
- **Smooth Page Transitions** using Reanimated 3
- **Micro-interactions** throughout the UI for better UX

### 👤 User System

#### Added
- **Supabase Authentication** - Email/password registration and login
- **User Profiles** - Username, avatar, bio, and location
- **Profile Pictures** - Upload to Supabase Storage with automatic optimization
- **Profile Editing** - Update profile information and avatar
- **User Statistics** - View total reports and karma earned
- **Report History** - See all your past submissions
- **Public Profiles** - View other users' profiles and contributions (UI ready, backend pending)

### 🚨 License Plate Detection

#### Added
- **Smart Detection** - Regex-based German license plate recognition
- **Automatic Scanning** - Detects plates in report descriptions
- **Zivil Warning Modal** - Shows when license plate detected for undercover vehicles
- **Safety Confirmation** - Requires explicit confirmation before submission
- **Landshut-specific** - Recognizes LA and surrounding district codes
- **Format Validation** - Ensures plates match German format (XX-YY 1234)

### ❓ FAQ Section

#### Added
- **Comprehensive FAQ** - 15+ questions covering traffic, cameras, legal, and app usage
- **Smart Search** - Real-time search with text highlighting
- **Category Filtering** - Filter by Traffic, Cameras, Legal, or App topics
- **Accordion UI** - Smooth collapsible sections with animations
- **Icon-based** - Visual icons for better scanning
- **Tags** - Quick topic identification

### ⭐ Karma System (Foundation)

#### Added
- **Karma Field** - Added to user_profiles table
- **Upvoting** - Users can vote on reports
- **Reputation Tracking** - Display user karma on profile
- **Report Karma** - Track individual report votes
- **Database Schema** - report_votes table for vote tracking

### 🗺️ Map & Reports

#### Enhanced
- **User Attribution** - Reports now linked to user accounts
- **License Plate Storage** - For verified Zivil vehicles only
- **Improved Modal** - Better styling and UX for report submission
- **Real-time Updates** - Instant display of new reports
- **Type Indicators** - Visual differentiation between Blitzer and Zivil

### 🎨 Components & Utilities

#### Added
- **GlassCard** - Reusable glassmorphism component with BlurView
- **FAQAccordion** - Animated collapsible FAQ component
- **LicensePlateDetector** - Smart license plate detection with modal
- **ThemeContext** - Centralized theme management
- **AuthContext** - Centralized authentication state
- **licensePlateRegex** - German plate validation utilities

### 📱 Navigation

#### Enhanced
- **4-Tab Navigation** - Dashboard, Community, FAQ, Profile
- **Stack Navigation** - For Auth and FullMap screens
- **Theme-aware** - Navigation colors adapt to dark/light mode
- **Smooth Transitions** - Modal presentations for auth flow

### 🛠️ Technical

#### Added
- **NativeWind** - Tailwind CSS for React Native
- **Reanimated 3** - Smooth animations and transitions
- **Zustand** - Lightweight state management (installed, ready to use)
- **Moti** - Declarative animations (installed, ready to use)
- **Gesture Handler** - Better touch interactions
- **Image Picker** - Camera roll access for avatars
- **Expo Sharing** - Social sharing capabilities

#### Updated
- **Expo SDK** - Already on SDK 51
- **React Native** - 0.74
- **Navigation** - React Navigation v6
- **Dependencies** - All packages updated to latest compatible versions

### 📚 Documentation

#### Added
- **README.md** - Complete v2.0 documentation with feature list
- **BACKEND_SETUP.md** - Step-by-step Supabase configuration guide
- **IMPLEMENTATION_PLAN.md** - Development roadmap and architecture
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment verification tasks
- **CHANGELOG.md** - This file

### 🔧 Configuration

#### Added
- **tailwind.config.js** - Tailwind CSS configuration with custom colors
- **babel.config.js** - Updated with Reanimated plugin
- **App.js** - Completely restructured with providers and new navigation

### 🐛 Bug Fixes
- Fixed dark mode system detection
- Improved modal styling consistency
- Fixed theme persistence issues
- Better error handling in auth flows

---

## [1.0.0] - 2024

### Initial Release
- Basic speed camera reporting
- Map view with markers
- Community feed/chat
- Settings screen
- Push notification support
- Real-time Supabase integration

---

## 🚧 Coming Soon (Roadmap)

### Version 2.1
- [ ] Complete karma calculation system
- [ ] Report verification flow
- [ ] Map filters (toggle report types)
- [ ] Share functionality implementation
- [ ] Offline sync logic
- [ ] Push notifications for nearby reports

### Version 2.2
- [ ] Public profile viewing
- [ ] Report editing (within time window)
- [ ] Report commenting
- [ ] Achievements/badges
- [ ] Analytics dashboard

### Version 3.0
- [ ] Multi-language support (English, Turkish)
- [ ] Report heatmaps
- [ ] Integration with navigation apps
- [ ] Advanced statistics
- [ ] Community challenges

---

**Note**: All v2.0 frontend features are complete. Backend setup (Supabase tables, storage, policies) is required before full functionality.
