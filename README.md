# Landshut Community App v2.0 🚀

A modern, feature-rich community platform for Landshut with real-time speed camera alerts, community features, and glassmorphism design.

![React Native](https://img.shields.io/badge/React_Native-0.74-blue)
![Expo](https://img.shields.io/badge/Expo-51.0-black)
![Supabase](https://img.shields.io/badge/Supabase-✓-green)

## ✨ Features

### 🎨 Modern Design
- **Glassmorphism UI** - Frosted glass effects throughout the app
- **Dark/Light Mode** - Smooth theme transitions with persistent preference
- **Brutal Modern Navbar** - Animated bottom navigation with glassmorphism
- **Smooth Animations** - Page transitions and micro-interactions using Reanimated 3

### 📍 Core Functionality
- **Real-time Speed Camera Reports** - Community-driven blitzer alerts
- **Interactive Map** - View all reports with filtering options
- **Live Feed** - Community chat and updates
- **Location-based** - Automatic GPS positioning for accurate reports

### 👤 User System
- **Authentication** - Supabase Auth with email/password
- **User Profiles** - Username, avatar, bio, and location
- **Profile Pictures** - Upload to Supabase Storage
- **User Statistics** - Track your reports and karma
- **Public Profiles** - View other users' contributions

### 🚨 License Plate Detection
- **Smart Detection** - Regex-based German license plate recognition
- **Zivil Warning** - Automatic modal when detecting plates for undercover vehicles
- **Safety First** - Explicit confirmation required before submission

### ❓ FAQ Section
- **Comprehensive** - Topics: Traffic, Cameras, Legal questions
- **Searchable** - Find answers quickly
- **Categorized** - Organized by topic (Traffic, Cameras, Legal, App)
- **Accordion UI** - Collapsible, smooth animations

### ⭐ Karma System
- **Community Voting** - Upvote helpful reports
- **Reputation** - Build your karma through contributions
- **Quality Control** - Auto-delete reports at 15 votes
- **Verification** - Community-driven accuracy

### 🗺️ Map Filters
- **Toggle Report Types** - Show/hide Blitzer, Baustelle, Kontrolle
- **Smart Filtering** - Quick access to relevant information

### 📊 Report History
- **Your Reports** - View all your past submissions
- **Statistics** - Total reports and karma earned
- **Recent Activity** - Quick access to latest reports

### 🔗 Share Functionality
- **Social Sharing** - WhatsApp, social media integration
- **Quick Share** - One-tap sharing of reports

### 📴 Offline Mode
- **Smart Caching** - Store recent reports locally
- **Auto-Sync** - Synchronize when back online
- **Reliability** - Works even with poor connection

## 🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 51)
- **Styling**: Tailwind CSS (NativeWind) + Custom Glassmorphism
- **Backend**: Supabase
  - Authentication
  - PostgreSQL Database
  - Storage (Profile pictures)
  - Real-time Subscriptions
- **State Management**: React Context API + Custom Hooks
- **Animations**: Reanimated 3 + Moti
- **Maps**: React Native Maps
- **Navigation**: React Navigation v6

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Sdaniel5/landshut-community-app.git
cd landshut-community-app

# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🗄️ Database Schema

### Tables

#### `user_profiles`
```sql
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
```

#### `reports`
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'blitzer', 'zivilstreife', 'baustelle'
  street TEXT NOT NULL,
  description TEXT,
  license_plate TEXT, -- For Zivil vehicles
  coordinates GEOGRAPHY(POINT),
  votes INT DEFAULT 0,
  karma INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `report_votes`
```sql
CREATE TABLE report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);
```

#### `community_messages`
```sql
CREATE TABLE community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage Buckets
- **avatars** - Profile pictures (public read, authenticated write)

## 🚀 Key Features Explained

### Dark/Light Mode
The theme system uses React Context with AsyncStorage persistence:
- Toggle in Settings
- Smooth transitions (no flicker)
- System-wide consistency
- Saves preference across app restarts

### License Plate Detector
Automatically detects German license plates using regex:
```javascript
// Format: XX-YY 1234
// XX = 1-3 letters (city code)
// YY = 1-2 letters
// 1234 = 1-4 digits
```
When "Zivil" vehicle type is selected and a plate is detected:
1. Warning modal appears
2. Shows detected plate(s)
3. Requires explicit confirmation
4. Prevents accidental false reports

### Karma System
- **Earn Karma**: Submit accurate reports
- **Upvotes**: Community votes on report accuracy
- **Reputation**: Higher karma = trusted contributor
- **Auto-cleanup**: Reports auto-delete at 15 votes (assumed resolved)

### FAQ System
Content covers:
- **Traffic Rules** - Speed limits, violations, consequences
- **Speed Cameras** - Types, how they work, common locations
- **Legal** - Appeals, fines, obligations
- **App Usage** - How to use features effectively

## 📱 Screenshots

*Coming soon*

## 🔐 Security & Privacy

- **No License Plate Storage** (except confirmed Zivil vehicles)
- **Anonymous Usage** possible (guest mode)
- **EU Data Storage** only
- **Row Level Security** (RLS) enabled on all tables
- **Profanity Filter** on community messages
- **GDPR Compliant**

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙋 Support

For questions or issues:
- Open an issue on GitHub
- Contact via the Community feed in-app

## ⚠️ Disclaimer

This app is for informational purposes only. Always follow traffic laws and drive safely. The accuracy of community-reported speed cameras cannot be guaranteed.

## 🎯 Roadmap

- [ ] Push notifications for nearby reports
- [ ] Advanced filtering (time-based, distance)
- [ ] Report analytics and heatmaps
- [ ] Community achievements/badges
- [ ] Multi-language support
- [ ] Integration with navigation apps

---

**Made with ❤️ in Landshut**

v2.0.0 - February 2026
