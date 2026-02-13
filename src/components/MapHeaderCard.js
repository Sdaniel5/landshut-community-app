import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const LANDSHUT_COORDS = {
  latitude: 48.5376,
  longitude: 12.1511,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapHeaderCard({ reports, onExpand }) {
  const { theme, isDark } = useTheme();
  const recentReports = reports.slice(0, 50);

  const parseCoordinates = (geoPoint) => {
    if (!geoPoint) return null;
    const match = geoPoint.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      return {
        longitude: parseFloat(match[1]),
        latitude: parseFloat(match[2]),
      };
    }
    return null;
  };

  // Calculate recent activity (last hour)
  const recentActivity = reports.filter(r => {
    const created = new Date(r.created_at);
    const now = new Date();
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours < 1;
  }).length;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onExpand}
      activeOpacity={0.9}
    >
      {/* Map Background */}
      <MapView
        style={styles.map}
        initialRegion={LANDSHUT_COORDS}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        customMapStyle={isDark ? darkMapStyle : []}
      >
        {recentReports.map(report => {
          const coords = parseCoordinates(report.coordinates);
          if (!coords) return null;

          return (
            <Marker
              key={report.id}
              coordinate={coords}
              pinColor={report.type === 'blitzer' ? '#EF4444' : '#F59E0B'}
            />
          );
        })}
      </MapView>

      {/* Gradient Overlay for better text contrast */}
      <LinearGradient
        colors={isDark
          ? ['transparent', 'rgba(10, 14, 23, 0.85)']
          : ['transparent', 'rgba(0, 0, 0, 0.4)']
        }
        style={styles.gradient}
      />

      {/* Frosted Glass Bottom Panel (travel app style) */}
      <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.bottomPanel}>
        <View style={styles.panelContent}>
          {/* Title */}
          <Text style={[styles.title, { color: isDark ? '#FFF' : '#1A1D29' }]}>
            Landshut Blitzer
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>
            Live Verkehrsüberwachung
          </Text>

          {/* Info Badges (inspired by travel app) */}
          <View style={styles.badgeRow}>
            {/* Active Reports Badge */}
            <View style={[styles.infoBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name="location" size={16} color={theme.colors.primary} />
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                {reports.length} aktiv
              </Text>
            </View>

            {/* Recent Activity Badge */}
            {recentActivity > 0 && (
              <View style={[styles.infoBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
                <Text style={[styles.badgeText, { color: theme.colors.warning }]}>
                  {recentActivity} neue
                </Text>
              </View>
            )}

            {/* Rating/Votes Indicator */}
            <View style={[styles.infoBadge, { backgroundColor: theme.colors.success + '20' }]}>
              <Ionicons name="thumbs-up" size={16} color={theme.colors.success} />
              <Text style={[styles.badgeText, { color: theme.colors.success }]}>
                {Math.floor(reports.reduce((sum, r) => sum + (r.votes || 0), 0) / Math.max(reports.length, 1))} Ø
              </Text>
            </View>
          </View>
        </View>

        {/* Expand Button (teal gradient) */}
        <LinearGradient
          colors={theme.colors.gradientTeal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.expandButton}
        >
          <Text style={styles.expandText}>Zur Karte</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </LinearGradient>
      </BlurView>

      {/* Top Right Corner Badge (like the example) */}
      <View style={[styles.cornerBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }]}>
        <Ionicons name="navigate" size={14} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  map: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  // Frosted glass panel at bottom (travel app style)
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  panelContent: {
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  // Info badges row (like distance, temperature in example)
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // Expand button (teal, like "Let's GO trip!" in example)
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  expandText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Corner badge
  cornerBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 12,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

// Enhanced dark mode map style
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1a1f2e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8896ab" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a1f2e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2d3748" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f1419" }] },
];
