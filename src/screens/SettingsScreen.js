import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [pushEnabled, setPushEnabled] = useState(true);
  const [blitzerNotifications, setBlitzerNotifications] = useState(true);
  const [feedNotifications, setFeedNotifications] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const push = await AsyncStorage.getItem('pushEnabled');
      const blitzer = await AsyncStorage.getItem('blitzerNotifications');
      const feed = await AsyncStorage.getItem('feedNotifications');

      if (push !== null) setPushEnabled(JSON.parse(push));
      if (blitzer !== null) setBlitzerNotifications(JSON.parse(blitzer));
      if (feed !== null) setFeedNotifications(JSON.parse(feed));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async function handlePushToggle(value) {
    setPushEnabled(value);
    await AsyncStorage.setItem('pushEnabled', JSON.stringify(value));

    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Benachrichtigungen deaktiviert',
          'Bitte aktivieren Sie Benachrichtigungen in den Systemeinstellungen.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Einstellungen öffnen', onPress: () => Linking.openSettings() },
          ]
        );
        setPushEnabled(false);
      }
    }
  }

  async function handleBlitzerToggle(value) {
    setBlitzerNotifications(value);
    await AsyncStorage.setItem('blitzerNotifications', JSON.stringify(value));
  }

  async function handleFeedToggle(value) {
    setFeedNotifications(value);
    await AsyncStorage.setItem('feedNotifications', JSON.stringify(value));
  }

  function handleAbout() {
    Alert.alert(
      'Über die App',
      'Landshut Community App v1.0.0\n\n' +
        'Eine Community-App für Landshut mit Blitzer-Meldungen und lokalem Chat.\n\n' +
        '⚠️ Diese App dient nur zu Informationszwecken. ' +
        'Bitte beachten Sie die Straßenverkehrsordnung.',
      [{ text: 'OK' }]
    );
  }

  function handlePrivacy() {
    Alert.alert(
      'Datenschutz',
      '🔒 Ihre Privatsphäre ist uns wichtig:\n\n' +
        '• Keine Kennzeichen-Speicherung\n' +
        '• Anonyme Nutzung möglich\n' +
        '• Daten werden nur in der EU gespeichert\n' +
        '• RLS (Row Level Security) aktiv\n' +
        '• Nachrichten werden gefiltert\n\n' +
        'Ihre Daten werden ausschließlich für die App-Funktionalität verwendet.',
      [{ text: 'Verstanden' }]
    );
  }

  function handleHelp() {
    Alert.alert(
      'Hilfe',
      '📖 So funktioniert die App:\n\n' +
        '1. Karte: Sehen Sie Blitzer in Ihrer Nähe\n' +
        '2. Melden: Tippen Sie auf + um einen Blitzer zu melden\n' +
        '3. Voten: Tippen Sie auf einen Marker, um zu voten\n' +
        '4. Feed: Chatten Sie mit der Community\n\n' +
        '💡 Tipp: Marker verschwinden nach 15 Votes automatisch.',
      [{ text: 'OK' }]
    );
  }

  const SettingItem = ({ icon, title, subtitle, children }) => (
    <View style={[styles.settingItem, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#2196F3" />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: isDark ? '#FFF' : '#000' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : '#666' }]}>
          BENACHRICHTIGUNGEN
        </Text>

        <SettingItem
          icon="notifications"
          title="Push-Benachrichtigungen"
          subtitle="Aktivieren Sie Benachrichtigungen"
        >
          <Switch
            value={pushEnabled}
            onValueChange={handlePushToggle}
            trackColor={{ false: '#767577', true: '#90CAF9' }}
            thumbColor={pushEnabled ? '#2196F3' : '#f4f3f4'}
          />
        </SettingItem>

        <SettingItem
          icon="camera"
          title="Blitzer-Meldungen"
          subtitle="Neue Blitzer in Ihrer Nähe"
        >
          <Switch
            value={blitzerNotifications}
            onValueChange={handleBlitzerToggle}
            disabled={!pushEnabled}
            trackColor={{ false: '#767577', true: '#90CAF9' }}
            thumbColor={blitzerNotifications ? '#2196F3' : '#f4f3f4'}
          />
        </SettingItem>

        <SettingItem
          icon="chatbubbles"
          title="Feed-Benachrichtigungen"
          subtitle="Neue Nachrichten im Community-Feed"
        >
          <Switch
            value={feedNotifications}
            onValueChange={handleFeedToggle}
            disabled={!pushEnabled}
            trackColor={{ false: '#767577', true: '#90CAF9' }}
            thumbColor={feedNotifications ? '#2196F3' : '#f4f3f4'}
          />
        </SettingItem>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : '#666' }]}>
          INFORMATION
        </Text>

        <TouchableOpacity onPress={handleAbout}>
          <SettingItem icon="information-circle" title="Über die App">
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#AAA' : '#666'} />
          </SettingItem>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePrivacy}>
          <SettingItem icon="shield-checkmark" title="Datenschutz">
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#AAA' : '#666'} />
          </SettingItem>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleHelp}>
          <SettingItem icon="help-circle" title="Hilfe">
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#AAA' : '#666'} />
          </SettingItem>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: isDark ? '#666' : '#999' }]}>
          Made with ❤️ in Landshut
        </Text>
        <Text style={[styles.footerText, { color: isDark ? '#666' : '#999' }]}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 12,
    marginVertical: 2,
  },
});
