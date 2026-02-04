/**
 * Supabase Product Repository Implementation
 */

import { IProductRepository } from '../types'
import {
  Product,
  ProductFilters,
  ProductSortOption,
  PaginatedResult,
  PriceRange,
  Inventory,
} from '../../../types'
import { getSupabaseClient } from '../../../lib/supabaseClient'

export class SupabaseProductRepository implements IProductRepository {
  async getAllProducts(): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      // First, try to fetch only base products (if is_base_product column exists)
      // This prevents duplicate products from appearing on PLP
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .order('name', { ascending: true })

      if (error) throw error

      // Deduplicate products by name - keep only the first occurrence (base product)
      const products = this.mapProducts(data || [])
      return this.deduplicateProducts(products)
    } catch (error) {
      console.error('Error fetching all products:', error)
      return [] // Return empty array on error to prevent crashes
    }
  }
  
  // Get ALL products including color variants (for PDP variant selection)
  async getAllProductsWithVariants(): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .order('name', { ascending: true })

      if (error) throw error

      return this.mapProducts(data || [])
    } catch (error) {
      console.error('Error fetching all products with variants:', error)
      return []
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined // Not found
        throw error
      }

      return data ? this.mapProduct(data) : undefined
    } catch (error) {
      console.error('Error fetching product by id:', error)
      return undefined
    }
  }

  async listProducts(
    filters?: ProductFilters,
    sort: ProductSortOption = 'relevance',
    page: number = 1,
    pageSize?: number
  ): Promise<PaginatedResult<Product>> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `, { count: 'exact' })

      // Apply filters
      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        if (filters.subcategory) {
          query = query.eq('subcategory', filters.subcategory)
        }
        if (filters.priceRange) {
          query = query
            .gte('price', filters.priceRange[0])
            .lte('price', filters.priceRange[1])
        }
        if (filters.inStockOnly) {
          query = query.eq('in_stock', true)
        }
        if (filters.isNew) {
          query = query.eq('is_new', true)
        }
        if (filters.onSale) {
          query = query.not('original_price', 'is', null)
        }
        // Note: searchTerm is handled via listProducts with search query
        // For now, we'll skip searchTerm filtering here
      }

      // Apply sorting
      switch (sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true })
          break
        case 'price-desc':
          query = query.order('price', { ascending: false })
          break
        case 'name-asc':
          query = query.order('name', { ascending: true })
          break
        case 'name-desc':
          query = query.order('name', { ascending: false })
          break
        case 'rating':
          query = query.order('rating', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'relevance':
        default:
          query = query.order('name', { ascending: true })
      }

      // Apply pagination only if pageSize is explicitly provided
      if (pageSize !== undefined && pageSize > 0) {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) throw error

      const total = count || (data?.length || 0)
      // If no pageSize provided, return all items (no pagination)
      const effectivePageSize = pageSize || total
      const totalPages = effectivePageSize > 0 ? Math.ceil(total / effectivePageSize) : 1

      // Deduplicate products by name for PLP views
      const products = this.deduplicateProducts(this.mapProducts(data || []))
      
      return {
        items: products,
        total: products.length, // Use deduplicated count
        page,
        pageSize: effectivePageSize,
        totalPages: effectivePageSize > 0 ? Math.ceil(products.length / effectivePageSize) : 1,
        hasNext: pageSize !== undefined ? page < totalPages : false,
        hasPrevious: pageSize !== undefined ? page > 1 : false,
      }
    } catch (error) {
      console.error('Error listing products:', error)
      return {
        items: [],
        total: 0,
        page,
        pageSize: pageSize || 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      }
    }
  }

  async getProductsBySubcategory(
    category: string,
    subcategory?: string
  ): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)

      // Category mapping (same as mock)
      const categoryMappings: Record<string, string[]> = {
        'Women': ['Geometric', 'Abstract', 'Premium'],
        'Men': ['Modular', 'Sets'],
        'Accessories': ['Geometric', 'Abstract', 'Modular'],
      }

      const allowedCategories = categoryMappings[category] || []

      if (allowedCategories.length > 0) {
        query = query.in('category', allowedCategories)
      }

      if (subcategory) {
        query = query.eq('subcategory', subcategory)
      }

      const { data, error } = await query.order('name', { ascending: true })

      if (error) throw error

      // Deduplicate products by name
      return this.deduplicateProducts(this.mapProducts(data || []))
    } catch (error) {
      console.error('Error fetching products by subcategory:', error)
      return []
    }
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .or('is_best_seller.eq.true,is_new.eq.true')
        .limit(limit)
        .order('is_best_seller', { ascending: false })

      if (error) throw error

      // Deduplicate products by name
      return this.deduplicateProducts(this.mapProducts(data || []))
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  }

  async getNewArrivals(limit: number = 4): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .eq('is_new', true)
        .limit(limit)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Deduplicate products by name
      return this.deduplicateProducts(this.mapProducts(data || []))
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
      return []
    }
  }

  async getNewReleases(limit?: number): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .eq('is_new', true)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      const products = this.mapProducts(data || [])

      // Fallback if no new products
      if (products.length === 0) {
        const fallbackQuery = supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, image_order),
            product_variants(*)
          `)
          .order('id', { ascending: true })
          .limit(limit || 12)

        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        if (!fallbackError && fallbackData) {
          return this.deduplicateProducts(this.mapProducts(fallbackData))
        }
      }

      return products
    } catch (error) {
      console.error('Error fetching new releases:', error)
      return []
    }
  }

  async getNewReleasesByCategory(
    category: string,
    limit?: number
  ): Promise<Product[]> {
    try {
      const categoryMappings: Record<string, string[]> = {
        'Women': ['Geometric', 'Abstract', 'Premium'],
        'Men': ['Modular', 'Sets'],
        'Accessories': ['Geometric', 'Abstract', 'Modular'],
      }

      const allowedCategories = categoryMappings[category] || []

      const supabase = getSupabaseClient()
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .eq('is_new', true)

      if (allowedCategories.length > 0) {
        query = query.in('category', allowedCategories)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Deduplicate products by name
      const products = this.deduplicateProducts(this.mapProducts(data || []))

      // Fallback if no new products
      if (products.length === 0) {
        let fallbackQuery = supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, image_order),
            product_variants(*)
          `)
          .order('id', { ascending: true })
          .limit(limit || 12)

        if (allowedCategories.length > 0) {
          fallbackQuery = fallbackQuery.in('category', allowedCategories)
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        if (!fallbackError && fallbackData) {
          return this.deduplicateProducts(this.mapProducts(fallbackData))
        }
      }

      return products
    } catch (error) {
      console.error('Error fetching new releases by category:', error)
      return []
    }
  }

  async getSaleProducts(): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .not('original_price', 'is', null)
        .order('price', { ascending: true })

      if (error) throw error

      // Deduplicate products by name
      return this.deduplicateProducts(this.mapProducts(data || []))
    } catch (error) {
      console.error('Error fetching sale products:', error)
      return []
    }
  }

  async getPriceRange(productIds?: string[]): Promise<PriceRange> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('products')
        .select('price')

      if (productIds && productIds.length > 0) {
        query = query.in('id', productIds)
      }

      const { data, error } = await query

      if (error) throw error

      if (!data || data.length === 0) {
        return { min: 0, max: 1000 }
      }

      const prices = data.map((p: any) => parseFloat(p.price))
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
      }
    } catch (error) {
      console.error('Error fetching price range:', error)
      return { min: 0, max: 1000 }
    }
  }

  async getInventory(
    productId: string,
    variantId?: string
  ): Promise<Inventory> {
    try {
      if (variantId) {
        const supabase = getSupabaseClient()
      const { data, error } = await supabase
          .from('product_variants')
          .select('stock_quantity, in_stock')
          .eq('id', variantId)
          .single()

        if (error) throw error

      return {
        productId,
        variantId,
        quantity: (data as any)?.stock_quantity || 0,
        lowStockThreshold: 10,
        inStock: (data as any)?.in_stock || false,
      }
      }

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select('stock_quantity, in_stock')
        .eq('id', productId)
        .single()

      if (error) throw error

      return {
        productId,
        quantity: (data as any)?.stock_quantity || 0,
        lowStockThreshold: 10,
        inStock: (data as any)?.in_stock || false,
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      return {
        productId,
        quantity: 0,
        lowStockThreshold: 10,
        inStock: false,
      }
    }
  }

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,subcategory.ilike.%${query}%,short_description.ilike.%${query}%`)
        .limit(limit)
        .order('name', { ascending: true })

      if (error) throw error

      // Deduplicate products by name for search results
      return this.deduplicateProducts(this.mapProducts(data || []))
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  async getProductVariants(baseProductId: string): Promise<Product[]> {
    try {
      const baseProduct = await this.getProductById(baseProductId)
      if (!baseProduct) return []

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, image_order),
          product_variants(*)
        `)
        .eq('name', baseProduct.name)
        .order('id', { ascending: true })

      if (error) throw error

      return this.mapProducts(data || [])
    } catch (error) {
      console.error('Error fetching product variants:', error)
      return []
    }
  }

  async getBaseProductId(productId: string): Promise<string | undefined> {
    try {
      const product = await this.getProductById(productId)
      if (!product) return undefined

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .order('id', { ascending: true })
        .limit(1)

      if (error) {
        throw error
      }

      // Return first product ID (base product) or the original if none found
      if (data && Array.isArray(data) && data.length > 0) {
        const firstItem = data[0] as { id: string }
        if (firstItem?.id) {
          return firstItem.id
        }
      }
      return productId
    } catch (error) {
      console.error('Error finding base product:', error)
      return productId // Fallback to original ID
    }
  }

  // Helper methods to map database rows to domain types
  private mapProducts(rows: any[]): Product[] {
    return rows.map(row => this.mapProduct(row))
  }

  private mapProduct(row: any): Product {
    // Get images from product_images table
    const images = row.product_images
      ?.sort((a: any, b: any) => a.image_order - b.image_order)
      .map((img: any) => img.image_url) || []

    // Get unique colors from variants
    const colorsSet = new Set<string>()
    row.product_variants?.forEach((v: any) => {
      if (v.color) colorsSet.add(v.color)
    })
    // Also add the product's own color if it has one
    if (row.color) colorsSet.add(row.color)
    const colors = Array.from(colorsSet)

    // Get unique sizes from variants
    const sizesSet = new Set<string>()
    row.product_variants?.forEach((v: any) => {
      if (v.size) sizesSet.add(v.size)
    })
    const sizes = Array.from(sizesSet)

    return {
      id: row.id,
      name: row.name,
      brand: row.brand || 'Salesforce Foundations',
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      image: row.image,
      images: images.length > 0 ? images : [row.image],
      category: row.category,
      subcategory: row.subcategory,
      size: sizes.length > 0 ? sizes : undefined,
      color: row.color || undefined,
      colors: colors.length > 0 ? colors : undefined,
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      storeAvailable: row.store_available,
      rating: row.rating ? parseFloat(row.rating) : undefined,
      reviewCount: row.review_count,
      isNew: row.is_new,
      isBestSeller: row.is_best_seller,
      isOnlineOnly: row.is_online_only,
      isLimitedEdition: row.is_limited_edition,
      variants: row.variants,
      sku: row.sku,
      shortDescription: row.short_description,
      discountPercentage: row.discount_percentage,
      percentOff: row.percent_off,
      promotionalMessage: row.promotional_message,
      description: row.description,
      keyBenefits: row.key_benefits ? (Array.isArray(row.key_benefits) ? row.key_benefits : []) : undefined,
      ingredients: row.ingredients ? (Array.isArray(row.ingredients) ? row.ingredients : []) : undefined,
      usageInstructions: row.usage_instructions ? (Array.isArray(row.usage_instructions) ? row.usage_instructions : []) : undefined,
      careInstructions: row.care_instructions ? (Array.isArray(row.care_instructions) ? row.care_instructions : []) : undefined,
      technicalSpecs: row.technical_specs || undefined,
      scents: row.scents ? (Array.isArray(row.scents) ? row.scents : []) : undefined,
      capacities: row.capacities ? (Array.isArray(row.capacities) ? row.capacities : []) : undefined,
      deliveryEstimate: row.delivery_estimate,
      returnsPolicy: row.returns_policy,
      warranty: row.warranty,
      videos: row.videos ? (Array.isArray(row.videos) ? row.videos : []) : undefined,
    }
  }

  /**
   * Deduplicate products by name for PLP views
   * This ensures only one product card appears per product family
   * (e.g., Pure Cube appears once, not once per color variant)
   * 
   * The method also consolidates color information from all variants
   */
  private deduplicateProducts(products: Product[]): Product[] {
    const productsByName = new Map<string, Product[]>()
    
    // Group products by name
    for (const product of products) {
      const existing = productsByName.get(product.name) || []
      existing.push(product)
      productsByName.set(product.name, existing)
    }
    
    // For each product name, return the first one but with consolidated colors
    const deduplicated: Product[] = []
    
    // Convert Map entries to array for iteration
    const entries = Array.from(productsByName.entries())
    for (const [_name, variants] of entries) {
      // Use the first variant as the base product
      const baseProduct = variants[0]
      
      // Collect all unique colors from all variants
      const allColors = new Set<string>()
      let hasVariants = false
      
      for (const variant of variants) {
        if (variant.color) {
          allColors.add(variant.color)
        }
        if (variant.colors) {
          variant.colors.forEach(c => allColors.add(c))
        }
      }
      
      // If there are multiple variants, mark as having variants
      if (variants.length > 1) {
        hasVariants = true
      }
      
      // Create the consolidated product
      const consolidated: Product = {
        ...baseProduct,
        colors: allColors.size > 0 ? Array.from(allColors) : baseProduct.colors,
        variants: hasVariants ? variants.length - 1 : baseProduct.variants,
      }
      
      deduplicated.push(consolidated)
    }
    
    return deduplicated
  }
}
