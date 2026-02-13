import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen({ navigation }) {
  const { theme } = useTheme();
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  const handleAuth = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      Alert.alert('Fehler', 'Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    if (!isLogin) {
      if (!formData.username) {
        Alert.alert('Fehler', 'Bitte gib einen Benutzernamen ein.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Fehler', 'Passwörter stimmen nicht überein.');
        return;
      }
      if (formData.password.length < 6) {
        Alert.alert('Fehler', 'Passwort muss mindestens 6 Zeichen lang sein.');
        return;
      }
      if (formData.username.length < 3) {
        Alert.alert('Fehler', 'Benutzername muss mindestens 3 Zeichen lang sein.');
        return;
      }
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, formData.username);
      }

      if (result.success) {
        if (!isLogin) {
          Alert.alert(
            'Erfolg!',
            'Account erstellt! Bitte bestätige deine E-Mail-Adresse.',
            [{ text: 'OK' }]
          );
        }
        // Navigation will be handled by auth state change
      } else {
        Alert.alert('Fehler', result.error || 'Ein Fehler ist aufgetreten.');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="flash" size={50} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {isLogin ? 'Willkommen zurück!' : 'Konto erstellen'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {isLogin
              ? 'Melde dich an, um Blitzer zu melden'
              : 'Werde Teil der Community'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Benutzername
              </Text>
              <View style={[styles.inputContainer, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border 
              }]}>
                <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Dein Benutzername"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text })}
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              E-Mail
            </Text>
            <View style={[styles.inputContainer, { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border 
            }]}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="deine@email.de"
                placeholderTextColor={theme.colors.textTertiary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Passwort
            </Text>
            <View style={[styles.inputContainer, { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border 
            }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textTertiary}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
              />
            </View>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Passwort bestätigen
              </Text>
              <View style={[styles.inputContainer, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border 
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                />
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Anmelden' : 'Registrieren'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Register */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={[styles.toggleText, { color: theme.colors.textSecondary }]}>
              {isLogin ? 'Noch kein Konto? ' : 'Bereits registriert? '}
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {isLogin ? 'Registrieren' : 'Anmelden'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip Button (Guest Mode) */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.skipText, { color: theme.colors.textTertiary }]}>
            Als Gast fortfahren
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
  },
  skipButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
  },
});
