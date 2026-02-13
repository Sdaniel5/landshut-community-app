import { useWindowDimensions } from 'react-native';

/**
 * useThumbZone Hook
 *
 * Detects if an element is within the "thumb zone" (bottom 120px of the screen)
 * for one-handed mobile interaction optimization.
 *
 * @returns {Object} { thumbZoneStart, isInThumbZone, screenHeight }
 */
export function useThumbZone() {
  const { height } = useWindowDimensions();

  // Thumb zone starts 120px from the bottom
  const THUMB_ZONE_HEIGHT = 120;
  const thumbZoneStart = height - THUMB_ZONE_HEIGHT;

  /**
   * Check if a given Y position is within the thumb-zone
   * @param {number} y - Y coordinate to check
   * @returns {boolean}
   */
  const isInThumbZone = (y) => y >= thumbZoneStart;

  return {
    thumbZoneStart,
    thumbZoneHeight: THUMB_ZONE_HEIGHT,
    isInThumbZone,
    screenHeight: height,
  };
}
