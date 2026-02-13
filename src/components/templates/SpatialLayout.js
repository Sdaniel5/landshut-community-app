import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import useNavigationStore from '../../stores/navigationStore';
import BubbleRing from '../molecules/BubbleRing';
import { useFadeTransition } from '../animations/morphTransition';

// Import mode components (placeholders for now, will be implemented in later phases)
import DashboardScreen from '../../screens/DashboardScreen'; // Using existing Dashboard as 3D Map placeholder
import FeedScreen from '../../screens/FeedScreen'; // Using existing Feed as Story placeholder

/**
 * SpatialLayout Component
 *
 * Main app container for the Spatial Bubble navigation system.
 * Replaces the traditional Tab Navigator with a revolutionary gesture-based interface.
 *
 * Features:
 * - Floating bubble ring navigation
 * - Mode switching with transitions
 * - Swipe gestures (down for stories, up for profile)
 * - Full-screen immersive modes
 *
 * Modes:
 * - 3DMap: 3D Map Explorer (currently DashboardScreen)
 * - Story: Instagram-style story timeline
 * - AR: Augmented Reality overlay
 * - Voice: Voice command center
 */
export default function SpatialLayout() {
  const { theme, isDark } = useTheme();
  const { currentMode, bubbleRingVisible } = useNavigationStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { opacity, fadeIn, fadeOut } = useFadeTransition();

  useEffect(() => {
    // Fade in on mount
    fadeIn();
  }, []);

  /**
   * Handle mode change with transition
   */
  useEffect(() => {
    setIsTransitioning(true);

    // Simple fade transition for now
    // Will be replaced with morphing in later iterations
    fadeOut(() => {
      setTimeout(() => {
        fadeIn(() => {
          setIsTransitioning(false);
        });
      }, 50);
    });
  }, [currentMode]);

  /**
   * Render the current mode component
   */
  const renderMode = () => {
    switch (currentMode) {
      case '3DMap':
        // Placeholder: Will be Map3DExplorer in Phase 3
        return <DashboardScreen />;

      case 'Story':
        // Placeholder: Will be StoryTimeline in Phase 5
        return <FeedScreen />;

      case 'AR':
        // Placeholder: Will be AROverlayScene in Phase 4
        return (
          <View style={styles.placeholder}>
            <Animated.Text style={[styles.placeholderText, { color: theme.colors.text }]}>
              👁️{'\n\n'}AR Mode{'\n'}Coming in Phase 4
            </Animated.Text>
          </View>
        );

      case 'Voice':
        // Placeholder: Will be VoiceCommandCenter in Phase 6
        return (
          <View style={styles.placeholder}>
            <Animated.Text style={[styles.placeholderText, { color: theme.colors.text }]}>
              🎤{'\n\n'}Voice Mode{'\n'}Coming in Phase 6
            </Animated.Text>
          </View>
        );

      default:
        return <DashboardScreen />;
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />

        {/* Main Content Area */}
        <Animated.View style={[styles.contentArea, { opacity }]}>
          {renderMode()}
        </Animated.View>

        {/* Bubble Ring Navigation */}
        {bubbleRingVisible && (
          <BubbleRing
            onBubblePress={(modeId) => {
              console.log('Switched to mode:', modeId);
            }}
          />
        )}

        {/* Profile Drawer Trigger (swipe up from bottom center) */}
        <TouchableWithoutFeedback onPress={() => console.log('Profile drawer coming soon')}>
          <View style={styles.profileTrigger} />
        </TouchableWithoutFeedback>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  container: {
    flex: 1
  },
  contentArea: {
    flex: 1
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 36
  },
  profileTrigger: {
    position: 'absolute',
    bottom: 0,
    left: '40%',
    right: '40%',
    height: 40,
    // Visual indicator (can be styled)
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  }
});
