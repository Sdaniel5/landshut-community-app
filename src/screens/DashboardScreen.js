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

      {/* Modern Floating Action Button with Gradient */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 12,
          }
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="white" />
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
                onPress={() => {
                  setFormData({ ...formData, type: 'blitzer' });
                  setDetectedPlates([]);
                  setLicenseWarningAccepted(false);
                }}
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
                onPress={() => {
                  setFormData({ ...formData, type: 'zivilstreife' });
                }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Modern FAB with premium feel
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Professional modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Enhanced modal content
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 28,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  // Modern typography for title
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  // Sleek type selector
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  // Premium type buttons
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // Modern input fields
  input: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '400',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  // Success indicator
  plateConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  plateConfirmedText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  // Action buttons
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
