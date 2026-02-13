import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Bubble from '../atoms/Bubble';
import useNavigationStore from '../../stores/navigationStore';

const { width, height } = Dimensions.get('window');

/**
 * BubbleRing Component
 *
 * Arranges navigation bubbles in a circular ring at the bottom of the screen.
 * Bubbles are positioned using circular mathematics for perfect spacing.
 *
 * Features:
 * - Circular layout with automatic spacing
 * - Fade-in animation on mount
 * - Active bubble indication
 * - Mode switching on bubble press
 */
export default function BubbleRing({ onBubblePress }) {
  const { currentMode, modes, switchMode } = useNavigationStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const bubbles = Object.values(modes);

  useEffect(() => {
    // Fade in and scale animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  /**
   * Calculate position for each bubble in the ring
   * @param {number} index - Bubble index
   * @param {number} total - Total number of bubbles
   * @returns {object} {left, top} position
   */
  const calculateBubblePosition = (index, total) => {
    const radius = 110; // Distance from center
    const angleStep = (2 * Math.PI) / total;
    const angle = index * angleStep - Math.PI / 2; // Start from top

    const centerX = width / 2;
    const centerY = height - 150; // Position near bottom

    return {
      left: centerX + radius * Math.cos(angle) - 35, // -35 to center the 70px bubble
      top: centerY + radius * Math.sin(angle) - 35
    };
  };

  const handleBubblePress = (modeId) => {
    switchMode(modeId);
    onBubblePress?.(modeId);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      {bubbles.map((bubble, index) => {
        const position = calculateBubblePosition(index, bubbles.length);

        return (
          <Bubble
            key={bubble.id}
            icon={bubble.icon}
            label={bubble.label}
            active={currentMode === bubble.id}
            onPress={() => handleBubblePress(bubble.id)}
            style={[
              styles.bubble,
              {
                position: 'absolute',
                left: position.left,
                top: position.top
              }
            ]}
          />
        );
      })}

      {/* Center indicator dot (optional visual element) */}
      <View
        style={[
          styles.centerDot,
          {
            position: 'absolute',
            left: width / 2 - 6,
            top: height - 150 - 6
          }
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'box-none' // Allow touches to pass through empty space
  },
  bubble: {
    // Position set dynamically
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  }
});
