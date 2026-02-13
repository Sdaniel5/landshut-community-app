import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

export default function GlassCard({ 
  children, 
  style, 
  blurIntensity = 80,
  borderWidth = 1,
  ...props 
}) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, style]} {...props}>
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
