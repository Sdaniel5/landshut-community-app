import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const LANDSHUT_COORDS = {
  latitude: 48.5376,
  longitude: 12.1511,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function FullMapScreen({ route, navigation }) {
  const { reports = [], focusReportId } = route.params || {};
  const mapRef = useRef(null);

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

  useEffect(() => {
    if (focusReportId && mapRef.current) {
      const focusReport = reports.find(r => r.id === focusReportId);
      if (focusReport) {
        const coords = parseCoordinates(focusReport.coordinates);
        if (coords) {
          mapRef.current.animateToRegion({
            ...coords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 500);
        }
      }
    }
  }, [focusReportId]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={LANDSHUT_COORDS}
      >
        {reports.map(report => {
          const coords = parseCoordinates(report.coordinates);
          if (!coords) return null;
          
          return (
            <Marker 
              key={report.id} 
              coordinate={coords}
              pinColor={report.type === 'blitzer' ? '#FF5252' : '#FFA726'}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{report.street}</Text>
                  <Text style={styles.calloutType}>
                    {report.type === 'blitzer' ? '📸 Blitzer' : '👮 Zivilstreife'}
                  </Text>
                  {report.description && (
                    <Text style={styles.calloutDescription}>{report.description}</Text>
                  )}
                  <Text style={styles.calloutVotes}>{report.votes}/15 Votes</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  callout: {
    minWidth: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  calloutVotes: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
