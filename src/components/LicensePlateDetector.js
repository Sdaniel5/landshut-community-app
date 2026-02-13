import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { extractPlatesFromText, formatLicensePlate } from '../utils/licensePlateRegex';

export default function LicensePlateDetector({ 
  vehicleType, 
  description, 
  onLicensePlateDetected,
  onWarningAccepted 
}) {
  const { theme } = useTheme();
  const [detectedPlates, setDetectedPlates] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    // Only detect license plates when vehicle type is "Zivil"
    if (vehicleType === 'zivilstreife' && description) {
      const plates = extractPlatesFromText(description);
      setDetectedPlates(plates);
      
      if (plates.length > 0) {
        setShowWarningModal(true);
        if (onLicensePlateDetected) {
          onLicensePlateDetected(plates);
        }
      }
    } else {
      setDetectedPlates([]);
    }
  }, [vehicleType, description]);

  const handleAcceptWarning = () => {
    setShowWarningModal(false);
    if (onWarningAccepted) {
      onWarningAccepted(detectedPlates);
    }
  };

  const handleCancelWarning = () => {
    setShowWarningModal(false);
    setDetectedPlates([]);
  };

  if (!showWarningModal || detectedPlates.length === 0) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showWarningModal}
      onRequestClose={handleCancelWarning}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.cardElevated }]}>
          {/* Warning Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
            <Ionicons name="warning" size={50} color={theme.colors.warning} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Achtung: Kennzeichen erkannt!
          </Text>

          {/* Detected Plates */}
          <View style={styles.platesContainer}>
            {detectedPlates.map((plate, index) => (
              <View 
                key={index} 
                style={[styles.plateTag, { 
                  backgroundColor: theme.colors.primary + '20',
                  borderColor: theme.colors.primary 
                }]}
              >
                <Text style={[styles.plateText, { color: theme.colors.primary }]}>
                  {formatLicensePlate(plate)}
                </Text>
              </View>
            ))}
          </View>

          {/* Warning Message */}
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            Kennzeichen von Zivilfahrzeugen können sich ändern. 
            Bitte nur melden, wenn du dir absolut sicher bist!
          </Text>

          <Text style={[styles.subMessage, { color: theme.colors.textTertiary }]}>
            Falsche Meldungen können andere Nutzer irreführen und werden bei wiederholtem 
            Fehlverhalten zu Account-Sperren führen.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.border }]}
              onPress={handleCancelWarning}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                Abbrechen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: theme.colors.warning }]}
              onPress={handleAcceptWarning}
            >
              <Text style={[styles.buttonText, { color: '#FFF' }]}>
                Ich bin sicher
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  platesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  plateTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    margin: 5,
  },
  plateText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  subMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    // Styles applied via theme
  },
  confirmButton: {
    // Styles applied via theme
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
