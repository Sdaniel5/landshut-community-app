import { Animated, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Morph Transition Animation
 *
 * Creates a smooth morphing animation from a bubble to a full-screen mode.
 * This is the signature transition of the Spatial Bubble navigation system.
 *
 * Animation phases:
 * 1. Bubble scales up slightly and moves toward center
 * 2. Bubble expands to fill screen
 * 3. Border radius reduces to 0 (becomes rectangular)
 * 4. Content fades in
 *
 * @param {object} bubblePosition - { x, y } position of the bubble
 * @returns {object} Animation values and control functions
 */
export const useMorphTransition = (bubblePosition = { x: width / 2, y: height - 150 }) => {
  const scale = new Animated.Value(1);
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);
  const borderRadius = new Animated.Value(35); // Bubble radius
  const contentOpacity = new Animated.Value(0);
  const bubbleOpacity = new Animated.Value(1);

  /**
   * Play the morph animation (bubble → full-screen)
   * @param {function} onComplete - Callback when animation completes
   */
  const morphToScreen = (onComplete) => {
    // Calculate distance to screen center
    const targetX = width / 2 - bubblePosition.x;
    const targetY = height / 2 - bubblePosition.y;

    Animated.sequence([
      // Phase 1: Move to center and scale slightly (300ms)
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: targetY,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        })
      ]),

      // Phase 2: Expand to full screen (400ms)
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 25, // Large enough to fill screen
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(borderRadius, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false // borderRadius not supported by native driver
        }),
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 300,
          delay: 100,
          useNativeDriver: true
        })
      ]),

      // Phase 3: Fade in content (200ms)
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(onComplete);
  };

  /**
   * Reverse the morph animation (full-screen → bubble)
   * @param {function} onComplete - Callback when animation completes
   */
  const morphToBubble = (onComplete) => {
    Animated.sequence([
      // Phase 1: Fade out content
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),

      // Phase 2: Shrink and restore border radius
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(borderRadius, {
          toValue: 35,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        }),
        Animated.timing(bubbleOpacity, {
          toValue: 1,
          duration: 250,
          delay: 100,
          useNativeDriver: true
        })
      ]),

      // Phase 3: Return to original position
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.spring(translateX, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        })
      ])
    ]).start(onComplete);
  };

  /**
   * Reset all animation values to initial state
   */
  const reset = () => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    borderRadius.setValue(35);
    contentOpacity.setValue(0);
    bubbleOpacity.setValue(1);
  };

  return {
    // Animation values
    scale,
    translateX,
    translateY,
    borderRadius,
    contentOpacity,
    bubbleOpacity,

    // Control functions
    morphToScreen,
    morphToBubble,
    reset
  };
};

/**
 * Simple fade transition (fallback)
 * Used when morphing is not needed or as a simpler alternative
 */
export const useFadeTransition = () => {
  const opacity = new Animated.Value(0);

  const fadeIn = (onComplete) => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start(onComplete);
  };

  const fadeOut = (onComplete) => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(onComplete);
  };

  return { opacity, fadeIn, fadeOut };
};

export default {
  useMorphTransition,
  useFadeTransition
};
