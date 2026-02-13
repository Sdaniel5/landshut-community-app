# Deployment Checklist - Landshut App v2.0

## 📋 Pre-Deployment Tasks

### Backend (Supabase) Setup
- [ ] Run all SQL commands from `BACKEND_SETUP.md`
- [ ] Create `user_profiles` table
- [ ] Modify `reports` table (add user_id, license_plate, karma, verified columns)
- [ ] Create `report_votes` table
- [ ] Create `report_verifications` table (optional)
- [ ] Update `community_messages` table
- [ ] Create `avatars` storage bucket
- [ ] Configure storage policies for avatars
- [ ] Enable real-time for all tables
- [ ] Verify RLS policies are working
- [ ] Test authentication flow
- [ ] Test image upload to storage

### Frontend Testing
- [ ] Test dark/light mode toggle
- [ ] Test theme persistence across app restarts
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test profile creation
- [ ] Test profile editing
- [ ] Test avatar upload
- [ ] Test report submission (guest mode)
- [ ] Test report submission (authenticated)
- [ ] Test license plate detection
- [ ] Test Zivil warning modal
- [ ] Test FAQ search functionality
- [ ] Test FAQ category filtering
- [ ] Test karma system
- [ ] Test voting on reports
- [ ] Test report history
- [ ] Navigate through all screens
- [ ] Test smooth animations
- [ ] Test on Android device
- [ ] Test on iOS device (if available)

### Code Quality
- [ ] Remove console.logs from production code
- [ ] Check for hardcoded credentials
- [ ] Verify .gitignore includes node_modules, .env
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Optimize images and assets
- [ ] Test offline mode functionality
- [ ] Check bundle size
- [ ] Performance profiling

### Documentation
- [x] README.md updated with v2 features
- [x] BACKEND_SETUP.md created
- [x] IMPLEMENTATION_PLAN.md created
- [x] Deployment checklist created
- [ ] Add screenshots to README
- [ ] Create user guide (optional)
- [ ] Document API endpoints (if any)

### App Store Preparation (Future)
- [ ] Create app icons (1024x1024 for iOS, various for Android)
- [ ] Create screenshots for stores (various devices)
- [ ] Write app description
- [ ] Set up privacy policy
- [ ] Set up terms of service
- [ ] Configure app.json with correct bundle IDs
- [ ] Set up EAS Build (Expo Application Services)
- [ ] Configure push notification credentials

## 🚀 Deployment Steps

### 1. Supabase Configuration
```bash
# Execute all SQL commands from BACKEND_SETUP.md in Supabase SQL Editor
# Or use Supabase CLI:
supabase db push
```

### 2. Environment Variables
Create `.env` file (if not using hardcoded):
```env
SUPABASE_URL=https://xydpshxaajsijqjjhasb.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 5. Build for Production (EAS Build)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## ✅ Post-Deployment Verification

### Functionality Checks
- [ ] New users can register
- [ ] Users can log in
- [ ] Profile pictures upload correctly
- [ ] Reports appear on map in real-time
- [ ] Voting updates immediately
- [ ] FAQ search works
- [ ] Theme toggle persists
- [ ] Offline mode caches data
- [ ] Share functionality works
- [ ] Push notifications work (if implemented)

### Performance Checks
- [ ] App loads within 3 seconds
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks
- [ ] Map performance is good with 100+ markers
- [ ] Image loading is optimized
- [ ] Real-time updates don't cause lag

### Security Checks
- [ ] RLS policies prevent unauthorized access
- [ ] Users can't modify other users' data
- [ ] Sensitive data not exposed in network tab
- [ ] License plates properly validated
- [ ] SQL injection not possible
- [ ] XSS protection in place

## 🐛 Known Issues / TODOs

### High Priority
- [ ] Implement actual karma calculation (currently just counter)
- [ ] Add report verification flow
- [ ] Implement map filters UI
- [ ] Add report history screen
- [ ] Implement share functionality
- [ ] Add offline sync logic

### Medium Priority
- [ ] Add push notifications
- [ ] Implement public profile viewing
- [ ] Add report editing (within time window)
- [ ] Add report deletion (own reports only)
- [ ] Improve error handling throughout
- [ ] Add loading states for all async operations

### Low Priority
- [ ] Add achievements/badges
- [ ] Implement report analytics
- [ ] Add multi-language support
- [ ] Create onboarding flow
- [ ] Add dark mode animation preview
- [ ] Implement report comments

## 📊 Monitoring

### Metrics to Track
- Daily active users
- Reports created per day
- Karma distributed
- Average session duration
- Crash rate
- API response times
- Storage usage

### Tools
- Supabase Dashboard - Database metrics
- Expo Analytics - App usage
- Sentry (optional) - Error tracking
- Google Analytics (optional) - User behavior

## 🔄 Update Process

### For Minor Updates
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Build new version with EAS
5. Submit to stores (if published)

### For Major Updates
1. Create new branch
2. Implement features
3. Test extensively
4. Merge to main
5. Update version in app.json
6. Update CHANGELOG.md
7. Build and deploy

## 📞 Support

If issues arise:
1. Check Supabase logs
2. Check Expo logs
3. Review recent commits
4. Test on multiple devices
5. Check user reports in community feed

---

**Current Status**: ✅ Development Complete | ⏳ Backend Setup Needed | 🚀 Ready for Testing

**Next Step**: Execute BACKEND_SETUP.md in Supabase, then test the app!
