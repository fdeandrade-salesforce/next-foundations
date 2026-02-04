/**
 * Variant Resolution Utilities
 * 
 * Shared logic for resolving product variants based on user selections.
 * Ensures consistent behavior across PDP, QuickViewModal, and other components.
 */

import { Product } from '../types'

// Extended product type for PDP-specific fields
export interface PDPProduct extends Product {
  size?: string[]
  color?: string
  colors?: string[]
  capacities?: string[]
  scents?: string[]
}

export interface VariantGroup {
  key: string // e.g., "size", "color", "capacity", "scent"
  label: string
  options: VariantOption[]
}

export interface VariantOption {
  id: string
  value: string
  variantId?: string // Optional: direct variant ID for this option (used in QuickView)
}

/**
 * Normalize option value for consistent matching
 */
export function normalizeOptionValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Check if a variant supports an option value (loose match)
 */
export function variantSupportsOption(
  variant: PDPProduct,
  groupKey: string,
  optionValue: string
): boolean {
  switch (groupKey) {
    case 'size':
      return variant.size?.includes(optionValue) || false
    case 'color':
      return variant.color === optionValue || variant.colors?.includes(optionValue) || false
    case 'capacity':
      return variant.capacities?.includes(optionValue) || false
    case 'scent':
      return variant.scents?.includes(optionValue) || false
    default:
      return false
  }
}

/**
 * Check if a variant has an EXACT match for an option value (strict match)
 * For color: variant.color must equal optionValue (not just in colors array)
 * For size/capacity/scent: must be in the array
 */
export function variantHasExactOption(
  variant: PDPProduct,
  groupKey: string,
  optionValue: string
): boolean {
  switch (groupKey) {
    case 'size':
      return variant.size?.includes(optionValue) || false
    case 'color':
      // For color, EXACT match means variant.color === optionValue
      // This ensures pure-cube-black matches "Black", not pure-cube-white
      return variant.color === optionValue || false
    case 'capacity':
      return variant.capacities?.includes(optionValue) || false
    case 'scent':
      return variant.scents?.includes(optionValue) || false
    default:
      return false
  }
}

/**
 * Get variant's option value for a group
 */
export function getVariantOptionValue(
  variant: PDPProduct,
  groupKey: string
): string | undefined {
  switch (groupKey) {
    case 'size':
      return variant.size?.[0] // Use first size if multiple
    case 'color':
      return variant.color
    case 'capacity':
      return variant.capacities?.[0]
    case 'scent':
      return variant.scents?.[0]
    default:
      return undefined
  }
}

/**
 * Find EXACT matching variant - ALL selected options must match EXACTLY
 * This is the strictest match and always takes priority
 * For color: uses variantHasExactOption (variant.color === selectedColor)
 * For other attributes: uses variantSupportsOption
 */
export function findExactMatchingVariant(
  variants: PDPProduct[],
  selectedValues: Record<string, string>,
  variantGroups?: VariantGroup[]
): PDPProduct | null {
  // If no selections, no exact match
  if (Object.keys(selectedValues).length === 0) {
    return null
  }

  // Find variants where ALL selected options match EXACTLY
  const exactMatches: PDPProduct[] = []
  
  for (const variant of variants) {
    let matchesAll = true
    
    // Check every selected option with STRICT matching
    for (const [groupKey, optionValue] of Object.entries(selectedValues)) {
      // For color, use exact match (variant.color === optionValue)
      // For others, use supports match
      if (groupKey === 'color') {
        if (!variantHasExactOption(variant, groupKey, optionValue)) {
          matchesAll = false
          break
        }
      } else {
        if (!variantSupportsOption(variant, groupKey, optionValue)) {
          matchesAll = false
          break
        }
      }
    }
    
    // If all selected options match exactly, this is an exact match
    if (matchesAll) {
      exactMatches.push(variant)
    }
  }

  // If we have exact matches, prefer in-stock variants
  if (exactMatches.length > 0) {
    const inStockMatch = exactMatches.find(v => v.inStock)
    if (inStockMatch) return inStockMatch
    return exactMatches[0]
  }

  return null // No exact match found
}

/**
 * Find the best matching variant based on selected options (fallback only)
 * Only used when no exact match exists
 */
export function findBestMatchingVariant(
  variants: PDPProduct[],
  selectedValues: Record<string, string>
): PDPProduct {
  // Find variants that match ALL selected options
  const matchingVariants: PDPProduct[] = []
  
  for (const variant of variants) {
    let matchesAll = true
    for (const [groupKey, optionValue] of Object.entries(selectedValues)) {
      if (!variantSupportsOption(variant, groupKey, optionValue)) {
        matchesAll = false
        break
      }
    }
    if (matchesAll) {
      matchingVariants.push(variant)
    }
  }

  // If we have exact matches, return the first one (or best one if we want to prioritize in-stock)
  if (matchingVariants.length > 0) {
    // Prefer in-stock variants
    const inStockVariant = matchingVariants.find(v => v.inStock)
    if (inStockVariant) return inStockVariant
    return matchingVariants[0]
  }

  // If no exact match, find the variant with the most matches
  let bestVariant: PDPProduct = variants[0] || ({} as PDPProduct)
  let bestMatches = 0

  for (const variant of variants) {
    let matches = 0
    for (const [groupKey, optionValue] of Object.entries(selectedValues)) {
      if (variantSupportsOption(variant, groupKey, optionValue)) {
        matches++
      }
    }
    if (matches > bestMatches) {
      bestMatches = matches
      bestVariant = variant
    }
  }

  return bestVariant
}

/**
 * Resolve current variant using strict two-step resolution: exact match first, then fallback
 * This is the main function to use for variant resolution
 */
export function resolveCurrentVariant(
  variants: PDPProduct[],
  selectedValues: Record<string, string>,
  baseProduct: PDPProduct,
  variantGroups?: VariantGroup[]
): PDPProduct {
  // STEP 1: Try exact match first - this ALWAYS wins if it exists
  const exactMatch = findExactMatchingVariant(variants, selectedValues, variantGroups)
  
  if (exactMatch) {
    // Exact match found - use it immediately, no fallback logic
    if (process.env.NODE_ENV === 'development') {
      console.log('[VariantResolution] EXACT MATCH found:', {
        variantId: exactMatch.id,
        variantColor: exactMatch.color,
        selectedValues,
      })
    }
    return exactMatch
  }
  
  // STEP 2: No exact match - use best-match fallback
  const bestMatch = findBestMatchingVariant(variants, selectedValues)
  
  // Debug logging (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[VariantResolution] NO EXACT MATCH - using best-match fallback:', {
      variantId: bestMatch.id,
      variantColor: bestMatch.color,
      selectedValues,
    })
  }
  
  return bestMatch
}
