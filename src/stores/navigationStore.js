import { create } from 'zustand';

/**
 * Navigation Store for Spatial Bubble System
 *
 * Manages the current mode, bubble visibility, and navigation state
 * for the revolutionary bubble-based navigation system.
 */
const useNavigationStore = create((set) => ({
  // Current active mode
  currentMode: '3DMap',

  // Previous mode (for back navigation)
  previousMode: null,

  // Bubble ring visibility
  bubbleRingVisible: true,

  // Available modes
  modes: {
    '3DMap': {
      id: '3DMap',
      icon: '🗺️',
      label: '3D Map',
      component: 'Map3DExplorer'
    },
    'Story': {
      id: 'Story',
      icon: '📖',
      label: 'Stories',
      component: 'StoryTimeline'
    },
    'AR': {
      id: 'AR',
      icon: '👁️',
      label: 'AR View',
      component: 'AROverlayScene'
    },
    'Voice': {
      id: 'Voice',
      icon: '🎤',
      label: 'Voice',
      component: 'VoiceCommandCenter'
    }
  },

  // Switch to a new mode
  switchMode: (mode) => set((state) => ({
    currentMode: mode,
    previousMode: state.currentMode
  })),

  // Toggle bubble ring visibility
  toggleBubbleRing: () => set((state) => ({
    bubbleRingVisible: !state.bubbleRingVisible
  })),

  // Hide bubble ring
  hideBubbleRing: () => set({ bubbleRingVisible: false }),

  // Show bubble ring
  showBubbleRing: () => set({ bubbleRingVisible: true }),

  // Go back to previous mode
  goBack: () => set((state) => ({
    currentMode: state.previousMode || '3DMap',
    previousMode: null
  })),

  // Reset to default state
  reset: () => set({
    currentMode: '3DMap',
    previousMode: null,
    bubbleRingVisible: true
  })
}));

export default useNavigationStore;
