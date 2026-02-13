import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import GlassCard from './GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { getNeonColorForType } from '../constants/neonColors';

/**
 * NeonGlassCard Component
 *
 * Enhanced glassmorphism card with neon glow and optional pulse animation.
 * Perfect for "Glass-for-me" design system.
 *
 * @param {string} type - Report type: 'blitzer' or 'zivilstreife'
 * @param {number} glowIntensity - Glow intensity (0-1), default 0.6
 * @param {boolean} animated - Enable pulse animation for new items
 * @param {number} animationDuration - Duration in ms for one pulse cycle
 */
export default function NeonGlassCard({
  children,
  type = null, // 'blitzer', 'zivilstreife', or null for accent
  glowIntensity = 0.6,
  animated = false,
  animationDuration = 2000,
  style,
  ...props
}) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get neon colors based on type
  const neonColors = type ? getNeonColorForType(type) : theme.neon.accent;
  const glowColor = neonColors.glow;

  useEffect(() => {
    if (animated) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, animationDuration, scaleAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <GlassCard
        neonGlow={glowColor}
        blurIntensity={100}
        style={[
          styles.card,
          {
            shadowColor: glowColor,
            shadowOpacity: glowIntensity,
          },
        ]}
        {...props}
      >
        {children}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
});
