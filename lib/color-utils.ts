/**
 * Color utility functions for consistent color swatch rendering
 */

/**
 * Maps color names to their hex color values
 * Used for rendering color swatches in product cards and PDPs
 */
export function getColorHex(colorName: string): string {
  const colorLower = colorName.toLowerCase().trim()
  
  const colorMap: Record<string, string> = {
    // Basic colors
    white: '#ffffff',
    black: '#000000',
    gray: '#6b7280',
    grey: '#6b7280',
    
    // Blues
    blue: '#3b82f6',
    navy: '#1e3a8a',
    'navy blue': '#1e3a8a',
    'light blue': '#93c5fd',
    'dark blue': '#1e40af',
    sky: '#0ea5e9',
    
    // Reds
    red: '#ef4444',
    'dark red': '#dc2626',
    'light red': '#fca5a5',
    burgundy: '#991b1b',
    maroon: '#800000',
    
    // Greens
    green: '#22c55e',
    'dark green': '#16a34a',
    'light green': '#86efac',
    olive: '#84cc16',
    mint: '#10b981',
    
    // Yellows & Oranges
    yellow: '#eab308',
    orange: '#f97316',
    'light orange': '#fb923c',
    coral: '#ff7f50',
    
    // Purples & Pinks
    purple: '#a855f7',
    pink: '#ec4899',
    'light pink': '#f9a8d4',
    magenta: '#d946ef',
    
    // Browns & Tans
    brown: '#a16207',
    tan: '#d2b48c',
    beige: '#f5f5dc',
    camel: '#c19a6b',
    khaki: '#c3b091',
    
    // Neutrals
    cream: '#fffdd0',
    ivory: '#fffff0',
    'off white': '#fafafa',
    'natural': '#faf0e6',
    taupe: '#8b7d6b',
    
    // Metallics
    silver: '#c0c0c0',
    gold: '#ffd700',
    bronze: '#cd7f32',
    charcoal: '#36454f',
    
    // Special
    printed: '#cccccc', // Will be handled separately with gradient
    multi: '#cccccc',
    multicolor: '#cccccc',
  }
  
  return colorMap[colorLower] || '#cccccc'
}

/**
 * Checks if a color should be rendered with a special style (like gradient for printed)
 */
export function isSpecialColor(colorName: string): boolean {
  const colorLower = colorName.toLowerCase().trim()
  return colorLower === 'printed' || colorLower === 'multi' || colorLower === 'multicolor'
}
