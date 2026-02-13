// German license plate validation
// Format: XX-YY 1234 or X-YY 1234
// XX = 1-3 letters (city/district code)
// YY = 1-2 letters
// 1234 = 1-4 digits

export const GERMAN_PLATE_REGEX = /^[A-ZÄÖÜ]{1,3}-[A-ZÄÖÜ]{1,2}\s?\d{1,4}[EH]?$/i;

export const LANDSHUT_PREFIXES = ['LA', 'DGF', 'VIB', 'MAI', 'KEH', 'MAL', 'ROT', 'VIT'];

export function isValidGermanPlate(plate) {
  if (!plate || typeof plate !== 'string') {
    return false;
  }
  
  // Remove extra whitespace and convert to uppercase
  const cleanedPlate = plate.trim().toUpperCase();
  
  return GERMAN_PLATE_REGEX.test(cleanedPlate);
}

export function isLandshutPlate(plate) {
  if (!isValidGermanPlate(plate)) {
    return false;
  }
  
  const prefix = plate.split('-')[0].toUpperCase();
  return LANDSHUT_PREFIXES.includes(prefix);
}

export function extractPlatesFromText(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  const words = text.toUpperCase().split(/\s+/);
  const plates = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Check if it matches the pattern
    if (GERMAN_PLATE_REGEX.test(word)) {
      plates.push(word);
    }
    
    // Check two-word combinations (e.g., "LA-AB" "1234")
    if (i < words.length - 1) {
      const combined = `${word} ${words[i + 1]}`;
      if (GERMAN_PLATE_REGEX.test(combined)) {
        plates.push(combined);
      }
    }
  }
  
  return [...new Set(plates)]; // Remove duplicates
}

export function formatLicensePlate(plate) {
  if (!plate) return '';
  
  // Remove extra spaces and convert to uppercase
  let formatted = plate.trim().toUpperCase();
  
  // Ensure there's exactly one space between letters and numbers
  formatted = formatted.replace(/([A-ZÄÖÜ]+)-([A-ZÄÖÜ]+)\s*(\d+)/i, '$1-$2 $3');
  
  return formatted;
}

// Example usage:
// isValidGermanPlate('LA-AB 1234') => true
// isValidGermanPlate('LA-A 123') => true
// isValidGermanPlate('LAB-CD 5678') => true
// isValidGermanPlate('INVALID') => false
// extractPlatesFromText('Blitzer bei LA-AB 1234 und M-XY 9999') => ['LA-AB 1234', 'M-XY 9999']
