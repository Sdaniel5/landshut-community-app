import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const LANDSHUT_COORDS = {
  latitude: 48.5376,
  longitude: 12.1511,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapHeaderCard({ reports, onExpand, isDark }) {
  const recentReports = reports.slice(0, 50);
  
  const parseCoordinates = (geoPoint) => {
    if (!geoPoint) return null;
    // Supabase PostGIS format: POINT(lon lat)
    const match = geoPoint.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      return {
        longitude: parseFloat(match[1]),
        latitude: parseFloat(match[2]),
      };
    }
    return null;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.cardContainer,
        { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }
      ]}
      onPress={onExpand}
      activeOpacity={0.8}
    >
      <MapView
        style={styles.compactMap}
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
              pinColor={report.type === 'blitzer' ? '#FF5252' : '#FFA726'}
            />
          );
        })}
      </MapView>
      
      <View style={styles.expandButton}>
        <Ionicons name="expand" size={20} color="white" />
      </View>
      
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{reports.length} aktiv</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  compactMap: {
    flex: 1,
  },
  expandButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  badge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Dark mode map style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
];
