import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, profile, signOut, updateProfile, uploadAvatar, loadProfile } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalKarma: 0,
    recentReports: [],
  });
  
  const [editData, setEditData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
  });

  useEffect(() => {
    if (profile) {
      setEditData({
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
      });
      fetchUserStats();
    }
  }, [profile]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get total reports
      const { count: reportCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get recent reports
      const { data: recentReports } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalReports: reportCount || 0,
        totalKarma: profile?.karma || 0,
        recentReports: recentReports || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!editData.username.trim()) {
      Alert.alert('Fehler', 'Benutzername darf nicht leer sein.');
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      username: editData.username,
      bio: editData.bio,
      location: editData.location,
    });

    if (result.success) {
      Alert.alert('Erfolg', 'Profil wurde aktualisiert!');
      setEditing(false);
    } else {
      Alert.alert('Fehler', result.error || 'Profil konnte nicht aktualisiert werden.');
    }
    setLoading(false);
  };

  const handleChangeAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Bitte erlaube Zugriff auf deine Fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setLoading(true);
        const uploadResult = await uploadAvatar(result.assets[0].uri);
        
        if (uploadResult.success) {
          Alert.alert('Erfolg', 'Profilbild wurde aktualisiert!');
          await loadProfile(user.id);
        } else {
          Alert.alert('Fehler', uploadResult.error || 'Bild konnte nicht hochgeladen werden.');
        }
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ein Fehler ist aufgetreten.');
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Fehler', 'Abmelden fehlgeschlagen.');
            }
          },
        },
      ]
    );
  };

  // If not logged in, show auth prompt
  if (!user || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.authPrompt}>
          <Ionicons name="person-circle-outline" size={100} color={theme.colors.textTertiary} />
          <Text style={[styles.authTitle, { color: theme.colors.text }]}>
            Nicht angemeldet
          </Text>
          <Text style={[styles.authSubtitle, { color: theme.colors.textSecondary }]}>
            Melde dich an, um dein Profil zu sehen und Blitzer zu melden.
          </Text>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.authButtonText}>Anmelden / Registrieren</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleChangeAvatar} disabled={loading}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="person" size={50} color={theme.colors.primary} />
              </View>
            )}
            {loading && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editAvatarButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleChangeAvatar}
            disabled={loading}
          >
            <Ionicons name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <TextInput
              style={[styles.editInput, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Benutzername"
              placeholderTextColor={theme.colors.textTertiary}
              value={editData.username}
              onChangeText={(text) => setEditData({ ...editData, username: text })}
            />
            <TextInput
              style={[styles.editInput, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Bio (optional)"
              placeholderTextColor={theme.colors.textTertiary}
              value={editData.bio}
              onChangeText={(text) => setEditData({ ...editData, bio: text })}
              multiline
              numberOfLines={2}
            />
            <TextInput
              style={[styles.editInput, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Standort (optional)"
              placeholderTextColor={theme.colors.textTertiary}
              value={editData.location}
              onChangeText={(text) => setEditData({ ...editData, location: text })}
            />
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {profile.username}
            </Text>
            {profile.bio && (
              <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>
                {profile.bio}
              </Text>
            )}
            {profile.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.location, { color: theme.colors.textSecondary }]}>
                  {profile.location}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Edit/Save Buttons */}
        <View style={styles.actionButtons}>
          {editing ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setEditing(false);
                  setEditData({
                    username: profile.username || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                  });
                }}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                  Abbrechen
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
                  {loading ? 'Speichern...' : 'Speichern'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="pencil" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
                Bearbeiten
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="flag" size={32} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {stats.totalReports}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Meldungen
          </Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="star" size={32} color={theme.colors.warning} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {stats.totalKarma}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Karma
          </Text>
        </View>
      </View>

      {/* Recent Reports */}
      {stats.recentReports.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Letzte Meldungen
          </Text>
          {stats.recentReports.map((report) => (
            <View
              key={report.id}
              style={[styles.reportCard, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border 
              }]}
            >
              <View style={styles.reportHeader}>
                <Ionicons 
                  name={report.type === 'blitzer' ? 'camera' : 'car'} 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.reportStreet, { color: theme.colors.text }]}>
                  {report.street}
                </Text>
              </View>
              <Text style={[styles.reportTime, { color: theme.colors.textTertiary }]}>
                {new Date(report.created_at).toLocaleDateString('de-DE')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: theme.colors.error + '20' }]}
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text style={[styles.signOutText, { color: theme.colors.error }]}>
          Abmelden
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
  },
  editForm: {
    width: '100%',
    marginBottom: 16,
  },
  editInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  recentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reportCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportStreet: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportTime: {
    fontSize: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  authButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
