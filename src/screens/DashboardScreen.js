import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useColorScheme, TouchableOpacity, Modal, TextInput, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapHeaderCard from '../components/MapHeaderCard';
import BlitzerFeedList from '../components/BlitzerFeedList';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';

export default function DashboardScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({
    type: 'blitzer',
    street: '',
    description: '',
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

  const handleSubmitReport = async () => {
    if (!formData.street.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie die Straße ein.');
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
            coordinates: `POINT(${coords.longitude} ${coords.latitude})`,
            votes: 0,
          },
        ]);

      if (error) throw error;

      Alert.alert('Erfolg', 'Blitzer wurde gemeldet!');
      setModalVisible(false);
      setFormData({ type: 'blitzer', street: '', description: '' });
      fetchReports();
    } catch (error) {
      Alert.alert('Fehler', 'Meldung konnte nicht erstellt werden.');
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
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
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="white" />
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
                  formData.type === 'blitzer' && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: 'blitzer' })}
              >
                <Text style={styles.typeButtonText}>📸 Blitzer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'zivilstreife' && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: 'zivilstreife' })}
              >
                <Text style={styles.typeButtonText}>👮 Zivilstreife</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5', 
                color: isDark ? '#FFF' : '#000' 
              }]}
              placeholder="Straße (z.B. Altstadt 15)"
              placeholderTextColor={isDark ? '#888' : '#666'}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5', 
                color: isDark ? '#FFF' : '#000' 
              }]}
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
                style={[styles.button, styles.buttonSubmit]}
                onPress={handleSubmitReport}
              >
                <Text style={styles.buttonText}>Melden</Text>
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
    backgroundColor: '#2196F3',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
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
  },
  typeButton: {
    flex: 1,
    padding: 14,
    marginHorizontal: 5,
    borderRadius: 12,
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
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
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
});
