# 🎨 Assets erforderlich

Die folgenden Asset-Dateien müssen noch erstellt werden:

## App Icons

### `assets/icon.png`
- **Größe:** 1024x1024 px
- **Format:** PNG (transparent oder mit Hintergrund)
- **Design:** App-Logo (z.B. Landshut Stadtsilhouette + Blitzer-Symbol)
- **Farben:** Blau (#2196F3) als Hauptfarbe

### `assets/adaptive-icon.png` (Android)
- **Größe:** 1024x1024 px
- **Format:** PNG (transparent)
- **Design:** Nur das Icon ohne Hintergrund (wird auf farbigem Hintergrund gezeigt)

### `assets/splash.png`
- **Größe:** 1242x2436 px (iPhone X/11 Pro)
- **Format:** PNG
- **Hintergrund:** #1a1a2e (dunkelblau)
- **Design:** Logo zentriert

### `assets/notification-icon.png` (Android)
- **Größe:** 96x96 px
- **Format:** PNG (weiß auf transparent)
- **Design:** Einfaches Icon für Benachrichtigungen

## Schnelle Lösung

Erstelle Platzhalter-Icons mit diesen Tools:
- https://www.appicon.co/ (Auto-generiert alle Größen)
- https://icon.kitchen/ (Material Design Icon Generator)
- Canva / Figma (eigenes Design)

## Minimale Assets (zum Testen)

```bash
# Erstelle einfache Platzhalter (1x1px transparent)
cd assets
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon.png
cp icon.png adaptive-icon.png
cp icon.png splash.png
cp icon.png notification-icon.png
```

**Hinweis:** Diese Platzhalter funktionieren für Development. Für Production-Builds benötigst du echte Icons.
