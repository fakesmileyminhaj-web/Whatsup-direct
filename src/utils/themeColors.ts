import { ThemeColor } from '../types';

/**
 * Returns a darkish version of the selected theme color for the Home background
 * and the particle constellation canvas.
 */
export function getDarkThemeBg(themeColor: ThemeColor, customHex?: string): string {
  if (themeColor === 'whatsapp') {
    // Deep emerald night background
    return '#091E16'; // rgb(9, 30, 22)
  }
  if (themeColor === 'purple') {
    // Deep midnight royal purple background
    return '#150924'; // rgb(21, 9, 36)
  }

  // Custom color: derive a rich dark tint that preserves the exact hue
  const hex = customHex || '#EF4444';
  try {
    const clean = hex.replace('#', '').trim();
    let r = 239;
    let g = 68;
    let b = 68;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length === 6) {
      r = parseInt(clean.substring(0, 2), 16);
      g = parseInt(clean.substring(2, 4), 16);
      b = parseInt(clean.substring(4, 6), 16);
    }

    // Scale down luminance to darkish range (~10-14%) while retaining distinct hue
    const dr = Math.round(r * 0.14 + 7);
    const dg = Math.round(g * 0.14 + 7);
    const db = Math.round(b * 0.14 + 9);
    return `rgb(${dr}, ${dg}, ${db})`;
  } catch {
    return '#091E16';
  }
}

/**
 * Light theme background for settings and modal surfaces
 */
export function getLightThemeBg(themeColor: ThemeColor, customHex?: string): string {
  if (themeColor === 'whatsapp') return '#EEF6F2';
  if (themeColor === 'purple') return '#F5EEF9';
  const hex = customHex || '#EF4444';
  try {
    const clean = hex.replace('#', '').trim();
    let r = 239, g = 68, b = 68;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length === 6) {
      r = parseInt(clean.substring(0, 2), 16);
      g = parseInt(clean.substring(2, 4), 16);
      b = parseInt(clean.substring(4, 6), 16);
    }
    const br = Math.round(r * 0.05 + 244 * 0.95);
    const bg = Math.round(g * 0.05 + 245 * 0.95);
    const bb = Math.round(b * 0.05 + 246 * 0.95);
    return `rgb(${br}, ${bg}, ${bb})`;
  } catch {
    return '#EEF6F2';
  }
}
