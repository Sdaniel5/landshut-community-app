/**
 * Neon Color Palette for "Glass-for-me" Design System
 *
 * Electric Blue: Blitzer (Speed Cameras)
 * Vivid Amber: Zivilstreife (Civilian Patrol)
 * Purple Accent: General highlights
 */

export const NEON_COLORS = {
  blitzer: {
    primary: '#00D9FF',      // Electric Blue
    glow: 'rgba(0, 217, 255, 0.6)',
    glowSoft: 'rgba(0, 217, 255, 0.3)',
    gradient: ['#00D9FF', '#0099FF'],
    dark: '#00A8CC',
  },
  zivilstreife: {
    primary: '#FFB800',      // Vivid Amber
    glow: 'rgba(255, 184, 0, 0.6)',
    glowSoft: 'rgba(255, 184, 0, 0.3)',
    gradient: ['#FFB800', '#FF9500'],
    dark: '#CC9300',
  },
  accent: {
    primary: '#9D00FF',      // Purple
    glow: 'rgba(157, 0, 255, 0.6)',
    glowSoft: 'rgba(157, 0, 255, 0.3)',
    gradient: ['#9D00FF', '#7700CC'],
  },
  neutral: {
    white: 'rgba(255, 255, 255, 0.2)',
    whiteGlow: 'rgba(255, 255, 255, 0.1)',
  }
};

// Helper function to get neon color based on report type
export function getNeonColorForType(type) {
  if (type === 'blitzer') {
    return NEON_COLORS.blitzer;
  } else if (type === 'zivilstreife') {
    return NEON_COLORS.zivilstreife;
  }
  return NEON_COLORS.accent;
}
