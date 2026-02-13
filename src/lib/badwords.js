// Simple German bad words filter
const badWords = [
  'arschloch',
  'scheiße',
  'scheisse',
  'fick',
  'hurensohn',
  'wichser',
  'fotze',
  'nutte',
  'bastard',
  'idiot',
  'vollpfosten',
  // Add more as needed
];

export function filterBadWords(text) {
  if (!text) return text;
  
  let filtered = text;
  badWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, (match) => '*'.repeat(match.length));
  });
  
  return filtered;
}

export function containsBadWords(text) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  return badWords.some(word => lowerText.includes(word));
}
