import React, { useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import GlassCard from '../GlassCard';

/**
 * Bubble Component
 *
 * Single navigation bubble with glassmorphism effect, neon glow, and animations.
 * Core building block of the Spatial Bubble Navigation system.
 *
 * @param {string} icon - Emoji icon for the bubble
 * @param {string} label - Text label (optional)
 * @param {boolean} active - Whether this bubble is currently active
 * @param {function} onPress - Callback when bubble is pressed
 * @param {function} onLongPress - Callback for long press (quick actions)
 * @param {object} style - Additional styles
 */
export default function Bubble({
  icon,
  label,
  active = false,
  onPress,
  onLongPress,
  style
}) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

  // Pulse animation when active
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();

      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    } else {
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);

      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  }, [active]);

  // Press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      friction: 3
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3
    }).start();
  };

  const handlePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        friction: 3
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3
      })
    ]).start();

    // Spin animation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start(() => rotateAnim.setValue(0));

    onPress?.();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8]
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[
          styles.bubble,
          {
            transform: [{ scale: scaleAnim }, { rotate }]
          }
        ]}
      >
        {/* Glow effect (only when active) */}
        {active && (
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: theme.neon.accent.glow,
                opacity: glowOpacity,
                shadowColor: theme.neon.accent.primary,
                shadowOpacity: glowOpacity,
                shadowRadius: 20,
                elevation: 10
              }
            ]}
          />
        )}

        {/* Glass container */}
        <GlassCard
          blurIntensity={120}
          style={[
            styles.glass,
            active && {
              borderColor: theme.neon.accent.primary,
              borderWidth: 2
            }
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
          {label && (
            <Text
              style={[
                styles.label,
                {
                  color: active ? theme.neon.accent.primary : theme.colors.textSecondary
                }
              ]}
            >
              {label}
            </Text>
          )}
        </GlassCard>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  bubble: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  glow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: -1
  },
  glass: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    fontSize: 32,
    textAlign: 'center'
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center'
  }
});
