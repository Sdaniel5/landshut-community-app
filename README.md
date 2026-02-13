# 📍 Landshut Community App - Blitzer & Community Feed

Eine React Native/Expo Community-App für Landshut mit Echtzeit-Blitzer-Meldungen und lokalem Chat.

## ✨ Features

### 🗺️ Interactive Karte
- Full-Screen Map mit Landshut Fokus
- Blitzer & Zivilstreifen in Echtzeit
- Eigene Meldungen mit Straße, Typ und Details
- Voting-System (15 Votes → Marker verschwindet automatisch)

### 💬 Community Feed
- Lokaler Chat für die Landshut Community
- Bad-Words Filter (Deutsch)
- Echtzeit-Synchronisation via Supabase
- Anonyme oder authentifizierte Nutzung

### ⚙️ Settings
- Push-Benachrichtigungen konfigurieren
- Dark Mode (automatisch)
- Über, Datenschutz, Hilfe

### 🎉 Landshut Specials
- Werbe-Bereich für lokale Angebote
- Einfach erweiterbar

### 🔐 Datenschutz
- ⚠️ **KEINE Kennzeichen-Speicherung!**
- Row Level Security (RLS) auf Supabase
- Nur authentifizierte User können melden/chatten
- Bad-Words Filter für sichere Kommunikation

## 🚀 Setup

### 1. Voraussetzungen
- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- Supabase Account: https://supabase.com

### 2. Installation

```bash
cd landshut-community-app-blitzer-community-feed
npm install
```

### 3. Supabase Setup

1. Erstelle ein neues Projekt auf [Supabase](https://supabase.com)
2. Führe das SQL-Schema aus:
   - Öffne den SQL Editor in Supabase
   - Kopiere den Inhalt von `supabase/schema.sql`
   - Führe das SQL aus
3. Notiere deine Supabase URL und ANON Key

### 4. Konfiguration

Bearbeite `src/lib/supabase.js`:

```javascript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

### 5. Google Maps API (Android)

Bearbeite `app.json` und füge deinen Google Maps API Key ein:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
    }
  }
}
```

Anleitung: https://developers.google.com/maps/documentation/android-sdk/get-api-key

### 6. App starten

```bash
# Development Server
npm start

# iOS Simulator (macOS)
npm run ios

# Android Emulator
npm run android
```

## 📱 Push Notifications

Die App unterstützt Expo Push Notifications:

**Text-Format:**
```
📸 Neuer Blitzer in der [Straße] ([Zusatz])
```

**Konfiguration:**
1. Erstelle ein Expo Account
2. Führe `eas build:configure` aus
3. Passe `app.json` an (EAS Project ID)
4. Teste mit Expo Push Notification Tool: https://expo.dev/notifications

## 🗂️ Projektstruktur

```
landshut-community-app/
├── App.js                          # Main App Entry
├── app.json                        # Expo Config
├── package.json                    # Dependencies
├── src/
│   ├── screens/
│   │   ├── MapScreen.js           # Karte mit Blitzer-Meldungen
│   │   ├── FeedScreen.js          # Community Chat
│   │   └── SettingsScreen.js      # Einstellungen
│   └── lib/
│       ├── supabase.js            # Supabase Client
│       ├── notifications.js       # Push Notifications
│       └── badwords.js            # Bad-Words Filter
└── supabase/
    └── schema.sql                 # Datenbank Schema
```

## 🎨 Design

- **Dark Mode:** Automatisch basierend auf System-Einstellungen
- **Akzentfarbe:** Blau (#2196F3)
- **Plattform:** iOS & Android native UI-Komponenten

## 🛠️ Technologien

- **Frontend:** React Native, Expo
- **Backend:** Supabase (PostgreSQL + PostGIS + RLS)
- **Maps:** react-native-maps
- **Navigation:** React Navigation
- **Push:** Expo Notifications

## 📊 Datenbank Schema

### reports
| Spalte       | Typ                  | Beschreibung                      |
|--------------|----------------------|-----------------------------------|
| id           | UUID                 | Primary Key                       |
| type         | VARCHAR(50)          | 'blitzer' oder 'zivilstreife'     |
| street       | VARCHAR(255)         | Straßenname                       |
| description  | TEXT                 | Optional: Details                 |
| coordinates  | GEOGRAPHY(POINT)     | GPS-Koordinaten (PostGIS)         |
| votes        | INTEGER              | Vote-Count (Standard: 0)          |
| created_at   | TIMESTAMP            | Zeitstempel                       |
| user_id      | UUID                 | Foreign Key zu auth.users         |

### community_messages
| Spalte       | Typ                  | Beschreibung                      |
|--------------|----------------------|-----------------------------------|
| id           | UUID                 | Primary Key                       |
| user_id      | UUID                 | Foreign Key zu auth.users         |
| message      | TEXT                 | Chat-Nachricht (gefiltert)        |
| created_at   | TIMESTAMP            | Zeitstempel                       |

## 🔒 Sicherheit

- **RLS (Row Level Security):** Nur authentifizierte User können melden/chatten
- **Bad-Words Filter:** Deutsche Schimpfwörter werden automatisch gefiltert
- **Keine Kennzeichen:** Datenschutz-konform (keine persönlichen Daten)
- **Auto-Delete:** Reports mit ≥15 Votes werden automatisch gelöscht

## 🚦 Rechtlicher Hinweis

⚠️ **Diese App dient nur zu Informationszwecken.**

- Bitte beachten Sie die Straßenverkehrsordnung (StVO)
- Die Nutzung von Blitzer-Apps während der Fahrt ist in Deutschland verboten
- Verwenden Sie die App nur als Beifahrer oder vor Fahrtantritt

## 📝 Lizenz

MIT License - Frei für persönliche und kommerzielle Nutzung

## 🤝 Beitragen

Contributions sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue.

---

**Made with ❤️ in Landshut**
