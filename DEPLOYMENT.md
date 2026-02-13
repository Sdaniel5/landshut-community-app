# 🚀 Deployment Guide

## Supabase Backend Setup

### 1. Projekt erstellen
1. Gehe zu https://supabase.com und erstelle ein Konto
2. Erstelle ein neues Projekt
3. Wähle Region: **Europe (Frankfurt)** für DSGVO-Konformität
4. Notiere dir:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Public Key

### 2. Datenbank Schema
1. Öffne den SQL Editor in deinem Supabase Dashboard
2. Kopiere den kompletten Inhalt von `supabase/schema.sql`
3. Führe das SQL aus (Run)
4. Verifiziere, dass die Tabellen `reports` und `community_messages` erstellt wurden

### 3. Row Level Security (RLS)
- RLS ist bereits im Schema aktiviert
- Policies erlauben:
  - Alle können Meldungen/Nachrichten **lesen**
  - Nur authentifizierte User können **schreiben**

### 4. Authentifizierung konfigurieren
1. Gehe zu **Authentication** → **Providers**
2. Aktiviere **Anonymous Sign-Ins** (für einfache Nutzung)
3. Optional: Email/Password, Google, etc. aktivieren

### 5. Realtime aktivieren
1. Gehe zu **Database** → **Replication**
2. Aktiviere Realtime für:
   - `reports` Tabelle
   - `community_messages` Tabelle

## Frontend Deployment

### Option A: Expo Go (Development)

```bash
# Starte Development Server
npm start

# Scanne QR-Code mit Expo Go App
# iOS: App Store
# Android: Google Play
```

### Option B: EAS Build (Production)

#### 1. EAS CLI installieren
```bash
npm install -g eas-cli
eas login
```

#### 2. Projekt konfigurieren
```bash
eas build:configure
```

#### 3. Build erstellen

**Android APK (zum Testen):**
```bash
eas build --platform android --profile preview
```

**iOS Build (benötigt Apple Developer Account):**
```bash
eas build --platform ios --profile production
```

**Android AAB (für Google Play):**
```bash
eas build --platform android --profile production
```

#### 4. Build herunterladen
```bash
# Nach erfolgreichem Build
eas build:list
# Download-Link in Terminal oder Expo Dashboard
```

### Option C: Expo Application Services (Hosting)

```bash
# Publish zu Expo
expo publish

# Oder mit EAS Update
eas update --branch production
```

## Push Notifications Setup

### 1. Expo Push Notification Token
- Bereits in `src/lib/notifications.js` integriert
- Token wird beim App-Start generiert

### 2. Backend für Push (optional)
Erstelle eine Supabase Edge Function:

```sql
-- In Supabase: Database → Functions
CREATE OR REPLACE FUNCTION notify_new_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Hier kannst du einen Webhook zu Expo Push API senden
  -- Beispiel: https://exp.host/--/api/v2/push/send
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_report
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_report();
```

### 3. Expo Push Notification Tool
Teste Notifications: https://expo.dev/notifications

Beispiel:
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "sound": "default",
  "title": "📸 Neuer Blitzer",
  "body": "Neuer Blitzer in der Altstadt (Fest installiert)",
  "data": { "reportId": "uuid" }
}
```

## Google Maps API (Android)

### 1. API Key erstellen
1. Gehe zu https://console.cloud.google.com
2. Erstelle ein neues Projekt (oder wähle bestehendes)
3. Aktiviere **Maps SDK for Android**
4. Gehe zu **Credentials** → **Create Credentials** → **API Key**
5. Beschränke den Key auf Android (Package Name: `com.landshut.community`)

### 2. Key in App einsetzen
Bearbeite `app.json`:
```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "AIzaSy...dein-key-hier"
    }
  }
}
```

## App Store / Google Play Submission

### iOS App Store

1. **Voraussetzungen:**
   - Apple Developer Account ($99/Jahr)
   - Xcode (macOS)

2. **Build:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **App Store Connect:**
   - Screenshots erstellen
   - App-Beschreibung (Deutsch)
   - Datenschutz-Informationen
   - Altersfreigabe: 4+

### Google Play Store

1. **Voraussetzungen:**
   - Google Play Developer Account ($25 einmalig)

2. **Build:**
   ```bash
   eas build --platform android --profile production
   ```

3. **Google Play Console:**
   - Screenshots erstellen (phone, tablet)
   - Store Listing (Deutsch)
   - Datenschutzerklärung URL
   - Content Rating

## Umgebungsvariablen

Erstelle `.env` (nicht in Git committen!):

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_MAPS_API_KEY=AIzaSy...
EAS_PROJECT_ID=your-eas-project-id
```

## Performance & Monitoring

### Expo Analytics
```bash
# Im Dashboard: expo.dev/accounts/[username]/projects/[project]/insights
```

### Sentry (Error Tracking)
```bash
npm install @sentry/react-native
# Folge: https://docs.sentry.io/platforms/react-native/
```

## Wartung

### Auto-Cleanup (Supabase)
Führe regelmäßig aus (z.B. via Cron):
```sql
SELECT cleanup_old_messages();
```

### Updates deployen
```bash
# Code ändern
git commit -am "Update XYZ"

# Over-the-Air Update (ohne App-Store)
eas update --branch production
```

## Kosten

**Supabase Free Tier:**
- 500 MB Database
- 1 GB File Storage
- 2 GB Bandwidth
- → Ausreichend für kleine Community

**Expo Free Tier:**
- Unlimited Expo Go Development
- Begrenzte EAS Builds/Monat
- → Für Production: $29/Monat (Standard Plan)

**Google Maps:**
- $200 Free Credits/Monat
- → Ausreichend für ~28.000 Map Loads

---

**Bei Fragen:** Siehe README.md oder öffne ein Issue
