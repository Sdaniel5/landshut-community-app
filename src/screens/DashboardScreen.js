import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapHeaderCard from '../components/MapHeaderCard';
import BlitzerFeedList from '../components/BlitzerFeedList';
import LicensePlateDetector from '../components/LicensePlateDetector';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import * as Location from 'expo-location';

export default function DashboardScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [licenseWarningAccepted, setLicenseWarningAccepted] = useState(false);
  const [detectedPlates, setDetectedPlates] = useState([]);
  const [formData, setFormData] = useState({
    type: 'blitzer',
    street: '',
    description: '',
    licensePlate: '',
  });

  useEffect(() => {
    fetchReports();
    setupLocation();
    
    // Subscribe to realtime updates
    const subscription = supabase
      .channel('reports-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setupLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVote = async (reportId) => {
    try {
      // Get current report
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('votes')
        .eq('id', reportId)
        .single();

      if (fetchError) throw fetchError;

      const newVotes = (report.votes || 0) + 1;

      // Update votes
      const { error: updateError } = await supabase
        .from('reports')
        .update({ votes: newVotes })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Auto-delete if >= 15 votes
      if (newVotes >= 15) {
        const { error: deleteError } = await supabase
          .from('reports')
          .delete()
          .eq('id', reportId);

        if (deleteError) throw deleteError;
      }

      fetchReports();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleExpandMap = () => {
    navigation.navigate('FullMap', { reports });
  };

  const handleItemPress = (report) => {
    // Navigate to map and center on report
    navigation.navigate('FullMap', { 
      reports,
      focusReportId: report.id 
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleLicensePlateDetected = (plates) => {
    setDetectedPlates(plates);
    if (plates.length > 0) {
      setFormData({ ...formData, licensePlate: plates[0] });
    }
  };

  const handleWarningAccepted = () => {
    setLicenseWarningAccepted(true);
  };

  const handleSubmitReport = async () => {
    // Check if user is logged in
    if (!user) {
      Alert.alert(
        'Anmeldung erforderlich',
        'Bitte melde dich an, um Blitzer zu melden.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Anmelden', onPress: () => navigation.navigate('Auth') },
        ]
      );
      return;
    }

    if (!formData.street.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie die Straße ein.');
      return;
    }

    // Check if license plate was detected for Zivil but warning not accepted
    if (formData.type === 'zivilstreife' && detectedPlates.length > 0 && !licenseWarningAccepted) {
      Alert.alert('Warnung', 'Bitte bestätige die Warnung zum Kennzeichen.');
      return;
    }

    const LANDSHUT_COORDS = { latitude: 48.5376, longitude: 12.1511 };
    const coords = userLocation || LANDSHUT_COORDS;

    try {
      const { error } = await supabase
        .from('reports')
        .insert([
          {
            type: formData.type,
            street: formData.street,
            description: formData.description,
            license_plate: formData.type === 'zivilstreife' ? formData.licensePlate : null,
            coordinates: `POINT(${coords.longitude} ${coords.latitude})`,
            votes: 0,
            user_id: user.id,
            karma: 0,
          },
        ]);

      if (error) throw error;

      Alert.alert('Erfolg', 'Blitzer wurde gemeldet!');
      setModalVisible(false);
      setFormData({ type: 'blitzer', street: '', description: '', licensePlate: '' });
      setDetectedPlates([]);
      setLicenseWarningAccepted(false);
      fetchReports();
    } catch (error) {
      Alert.alert('Fehler', 'Meldung konnte nicht erstellt werden.');
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MapHeaderCard 
        reports={reports}
        onExpand={handleExpandMap}
        isDark={isDark}
      />
      
      <BlitzerFeedList
        reports={reports}
        onVote={handleVote}
        onItemPress={handleItemPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        isDark={isDark}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* License Plate Detector */}
      <LicensePlateDetector
        vehicleType={formData.type}
        description={formData.description}
        onLicensePlateDetected={handleLicensePlateDetected}
        onWarningAccepted={handleWarningAccepted}
      />

      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardElevated }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Blitzer melden
            </Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { 
                    backgroundColor: formData.type === 'blitzer' ? theme.colors.primary : theme.colors.border
                  }
                ]}
                onPress={() => {
                  setFormData({ ...formData, type: 'blitzer' });
                  setDetectedPlates([]);
                  setLicenseWarningAccepted(false);
                }}
              >
                <Text style={[styles.typeButtonText, { 
                  color: formData.type === 'blitzer' ? '#FFF' : theme.colors.text 
                }]}>
                  📸 Blitzer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { 
                    backgroundColor: formData.type === 'zivilstreife' ? theme.colors.primary : theme.colors.border
                  }
                ]}
                onPress={() => {
                  setFormData({ ...formData, type: 'zivilstreife' });
                }}
              >
                <Text style={[styles.typeButtonText, { 
                  color: formData.type === 'zivilstreife' ? '#FFF' : theme.colors.text 
                }]}>
                  👮 Zivilstreife
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card, 
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Straße (z.B. Altstadt 15)"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.card, 
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder={formData.type === 'zivilstreife' ? 'Details & Kennzeichen (z.B. LA-AB 1234)' : 'Details (optional)'}
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            {detectedPlates.length > 0 && licenseWarningAccepted && (
              <View style={[styles.plateConfirmed, { backgroundColor: theme.colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text style={[styles.plateConfirmedText, { color: theme.colors.success }]}>
                  Kennzeichen erkannt: {detectedPlates[0]}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setDetectedPlates([]);
                  setLicenseWarningAccepted(false);
                }}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={handleSubmitReport}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>Melden</Text>
              </TouchableOpacity>
            </View>
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  plateConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  plateConfirmedText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
