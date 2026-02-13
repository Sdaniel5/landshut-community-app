import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { sendLocalNotification } from '../lib/notifications';
import { useTheme } from '../contexts/ThemeContext';

const LANDSHUT_COORDS = {
  latitude: 48.5376,
  longitude: 12.1511,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const { theme, isDark } = useTheme();
  const mapRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const [formData, setFormData] = useState({
    type: 'blitzer',
    street: '',
    description: '',
    coordinates: null,
  });

  useEffect(() => {
    loadReports();
    setupLocationTracking();
    subscribeToReports();
  }, []);

  async function setupLocationTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Standort-Berechtigung verweigert');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  }

  async function loadReports() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .lt('votes', 15)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading reports:', error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  }

  function subscribeToReports() {
    const subscription = supabase
      .channel('reports_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          const newReport = payload.new;
          setReports(prev => [newReport, ...prev]);
          sendLocalNotification(newReport.street, newReport.description || 'Kein Zusatz');
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reports' },
        (payload) => {
          const updated = payload.new;
          if (updated.votes >= 15) {
            setReports(prev => prev.filter(r => r.id !== updated.id));
          } else {
            setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function handleSubmitReport() {
    if (!formData.street.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie die Straße ein.');
      return;
    }

    const coords = formData.coordinates || userLocation || LANDSHUT_COORDS;

    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          type: formData.type,
          street: formData.street,
          description: formData.description,
          coordinates: `POINT(${coords.longitude} ${coords.latitude})`,
          votes: 0,
        },
      ])
      .select();

    if (error) {
      Alert.alert('Fehler', 'Meldung konnte nicht erstellt werden.');
      console.error(error);
    } else {
      Alert.alert('Erfolg', 'Blitzer wurde gemeldet!');
      setModalVisible(false);
      setFormData({
        type: 'blitzer',
        street: '',
        description: '',
        coordinates: null,
      });
    }
  }

  async function handleVote(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const { error } = await supabase
      .from('reports')
      .update({ votes: report.votes + 1 })
      .eq('id', reportId);

    if (error) {
      console.error('Vote error:', error);
    }
  }

  function parseCoordinates(pointString) {
    if (!pointString) return null;
    const match = pointString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      return {
        longitude: parseFloat(match[1]),
        latitude: parseFloat(match[2]),
      };
    }
    return null;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={LANDSHUT_COORDS}
        showsUserLocation
        showsMyLocationButton
      >
        {reports.map((report) => {
          const coords = parseCoordinates(report.coordinates);
          if (!coords) return null;

          return (
            <Marker
              key={report.id}
              coordinate={coords}
              title={report.street}
              description={`${report.type === 'blitzer' ? '📸 Blitzer' : '👮 Zivilstreife'} - ${report.description || ''}`}
              pinColor={report.type === 'blitzer' ? '#FF5252' : '#FFC107'}
              onCalloutPress={() => handleVote(report.id)}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>
                  {report.type === 'blitzer' ? '📸' : '👮'}
                </Text>
                <Text style={styles.voteText}>{report.votes}/15</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}

      <TouchableOpacity
        style={[styles.fabReport, { backgroundColor: '#2196F3' }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fabAd, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}
        onPress={() => setAdModalVisible(true)}
      >
        <Text style={[styles.adText, { color: isDark ? '#FFF' : '#000' }]}>
          🎉 Landshut Specials
        </Text>
      </TouchableOpacity>

      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>
              Blitzer melden
            </Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: formData.type === 'blitzer'
                      ? `${theme.neon.blitzer.primary}30`
                      : theme.colors.border,
                    borderColor: formData.type === 'blitzer'
                      ? theme.neon.blitzer.primary
                      : 'transparent',
                    borderWidth: 2,
                    shadowColor: formData.type === 'blitzer'
                      ? theme.neon.blitzer.glow
                      : 'transparent',
                    shadowOpacity: formData.type === 'blitzer' ? 0.6 : 0,
                    shadowRadius: 8,
                    elevation: formData.type === 'blitzer' ? 6 : 0,
                  }
                ]}
                onPress={() => setFormData({ ...formData, type: 'blitzer' })}
              >
                <Text style={[styles.typeButtonText, {
                  color: formData.type === 'blitzer'
                    ? theme.neon.blitzer.primary
                    : theme.colors.text
                }]}>
                  📸 Blitzer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: formData.type === 'zivilstreife'
                      ? `${theme.neon.zivilstreife.primary}30`
                      : theme.colors.border,
                    borderColor: formData.type === 'zivilstreife'
                      ? theme.neon.zivilstreife.primary
                      : 'transparent',
                    borderWidth: 2,
                    shadowColor: formData.type === 'zivilstreife'
                      ? theme.neon.zivilstreife.glow
                      : 'transparent',
                    shadowOpacity: formData.type === 'zivilstreife' ? 0.6 : 0,
                    shadowRadius: 8,
                    elevation: formData.type === 'zivilstreife' ? 6 : 0,
                  }
                ]}
                onPress={() => setFormData({ ...formData, type: 'zivilstreife' })}
              >
                <Text style={[styles.typeButtonText, {
                  color: formData.type === 'zivilstreife'
                    ? theme.neon.zivilstreife.primary
                    : theme.colors.text
                }]}>
                  👮 Zivilstreife
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5', color: isDark ? '#FFF' : '#000' }]}
              placeholder="Straße (z.B. Altstadt 15)"
              placeholderTextColor={isDark ? '#888' : '#666'}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5', color: isDark ? '#FFF' : '#000' }]}
              placeholder="Details (optional)"
              placeholderTextColor={isDark ? '#888' : '#666'}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: formData.type === 'blitzer'
                      ? theme.neon.blitzer.primary
                      : theme.neon.zivilstreife.primary,
                    shadowColor: formData.type === 'blitzer'
                      ? theme.neon.blitzer.glow
                      : theme.neon.zivilstreife.glow,
                    shadowOpacity: 0.7,
                    shadowRadius: 10,
                    elevation: 8,
                  }
                ]}
                onPress={handleSubmitReport}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>Melden</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ad Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={adModalVisible}
        onRequestClose={() => setAdModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>
              🎉 Landshut Specials
            </Text>
            <ScrollView style={styles.adContent}>
              <Text style={[styles.adItem, { color: isDark ? '#FFF' : '#000' }]}>
                🍕 Pizza Luigi - 20% Rabatt mit Code: LANDSHUT20
              </Text>
              <Text style={[styles.adItem, { color: isDark ? '#FFF' : '#000' }]}>
                ☕ Café Zentral - Zweites Getränk gratis
              </Text>
              <Text style={[styles.adItem, { color: isDark ? '#FFF' : '#000' }]}>
                🎬 Kinopolis - Student Deal: 5€ Tickets
              </Text>
              <Text style={[styles.adItem, { color: isDark ? '#FFF' : '#000' }]}>
                🏋️ FitX - Probetraining kostenlos
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, styles.buttonSubmit]}
              onPress={() => setAdModalVisible(false)}
            >
              <Text style={styles.buttonText}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerText: {
    fontSize: 30,
  },
  voteText: {
    fontSize: 10,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  fabReport: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabAd: {
    position: 'absolute',
    left: 20,
    bottom: 80,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  adText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: '#757575',
  },
  buttonSubmit: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adContent: {
    marginVertical: 15,
    maxHeight: 300,
  },
  adItem: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
  },
});
