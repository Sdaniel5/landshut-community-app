import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

export default function GlassCard({
  children,
  style,
  blurIntensity = 100, // Enhanced from 80 to 100 for "Glass-for-me"
  borderWidth = 1,
  neonGlow = null, // Optional: neon glow color (e.g., theme.neon.blitzer.glow)
  ...props
}) {
  const { theme, isDark } = useTheme();

  const shadowStyle = neonGlow ? {
    shadowColor: neonGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  } : {};

  return (
    <View style={[styles.container, shadowStyle, style]} {...props}>
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          {
            borderColor: theme.colors.glassBorder,
            borderWidth,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    borderRadius: 16,
  },
});
