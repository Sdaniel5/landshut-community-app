import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

/**
 * GradientBorder Component
 *
 * Wraps content with a gradient border effect for "Glass-for-me" design.
 * Uses LinearGradient to create neon-accented borders.
 */
export default function GradientBorder({
  children,
  colors = null, // Array of gradient colors, e.g., theme.neon.blitzer.gradient
  borderWidth = 2,
  borderRadius = 16,
  style,
  ...props
}) {
  const { theme } = useTheme();

  // Default to neutral white gradient if no colors provided
  const gradientColors = colors || [
    theme.neon.neutral.white,
    theme.neon.neutral.whiteGlow,
  ];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradientContainer,
        { borderRadius, padding: borderWidth },
        style,
      ]}
      {...props}
    >
      <View
        style={[
          styles.innerContent,
          {
            borderRadius: borderRadius - borderWidth,
            backgroundColor: theme.colors.glassBackground,
          },
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    overflow: 'hidden',
  },
  innerContent: {
    flex: 1,
  },
});
