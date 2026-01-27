'use client'

import React, { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import ProductCard from './ProductCard'
import QuickViewModal from './QuickViewModal'
import LazyImage from './LazyImage'
import StoreLocatorModal from './StoreLocatorModal'
import NotifyMeModal from './NotifyMeModal'
import { addToCart } from '../lib/cart'

export interface Product {
  id: string
  name: string
  brand?: string
  price: number
  originalPrice?: number
  image: string
  images?: string[] // Multiple images for variants
  category: string
  subcategory: string
  size?: string[]
  color?: string
  colors?: string[] // Available color variants
  inStock: boolean
  stockQuantity?: number // Number of units in stock (0-50)
  rating?: number // 0-5
  reviewCount?: number
  badges?: ('new' | 'best-seller' | 'online-only' | 'limited-edition' | 'promotion')[]
  isNew?: boolean
  isBestSeller?: boolean
  isOnlineOnly?: boolean
  isLimitedEdition?: boolean
  storeAvailable?: boolean // For pickup badges
  variants?: number // Number of additional variants
  sku?: string // Product SKU
  shortDescription?: string // Short product description
  discountPercentage?: number // Product-level discount percentage
  percentOff?: number // Percent-off badge value
  promotionalMessage?: string // Promotional message (e.g., "Extra 25% Off with code EXTRA25")
}

interface FilterState {
  priceRange: [number, number]
  sizes: string[]
  colors: string[]
  categories: string[]
  subcategories: string[]
  inStockOnly: boolean
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'rating'

interface ProductListingPageProps {
  products: Product[]
  category: string
  subcategory?: string
  headerImage?: string
  enableInfiniteScroll?: boolean
  itemsPerPage?: number
  contentSlots?: {
    aboveGrid?: React.ReactNode
    withinGrid?: { 
      position: number
      content: React.ReactNode
      columns?: 1 | 2 | 3 | 4 | 'full' // Number of columns to span, or 'full' for full width
    }[]
  }
}

export default function ProductListingPage({
  products,
  category,
  subcategory,
  headerImage,
  enableInfiniteScroll = false,
  itemsPerPage = 24,
  contentSlots,
}: ProductListingPageProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [cardSize, setCardSize] = useState<'small' | 'big'>('big')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    availability: true,
    price: true,
    color: true,
    size: true,
  })
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    sizes: [],
    colors: [],
    categories: [],
    subcategories: [],
    inStockOnly: false,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [showStoreLocator, setShowStoreLocator] = useState(false)
  const [selectedStore, setSelectedStore] = useState<{
    id: string
    name: string
    address: string
  } | null>(null)
  const [visibleSubcategoriesCount, setVisibleSubcategoriesCount] = useState<number | null>(null)
  const subcategoriesContainerRef = useRef<HTMLDivElement>(null)
  const subcategoryButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Safety check for products
  const safeProducts = products || []

  // Extract available sizes and colors from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>()
    safeProducts.forEach((p) => p.size?.forEach((s) => sizes.add(s)))
    return Array.from(sizes).sort()
  }, [safeProducts])

  const availableColors = useMemo(() => {
    const colors = new Set<string>()
    safeProducts.forEach((p) => p.color && colors.add(p.color))
    return Array.from(colors)
  }, [safeProducts])

  // Get product counts for each filter option
  const getColorCount = (color: string) => {
    return safeProducts.filter((p) => p.color === color).length
  }

  const getSizeCount = (size: string) => {
    return safeProducts.filter((p) => p.size?.includes(size)).length
  }

  const getCategoryCount = (category: string) => {
    return safeProducts.filter((p) => p.category === category).length
  }

  const getPriceRangeCount = (min: number, max: number) => {
    return safeProducts.filter((p) => p.price >= min && p.price <= max).length
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const availableCategories = useMemo(() => {
    const categories = new Set<string>()
    safeProducts.forEach((p) => categories.add(p.category))
    return Array.from(categories).sort()
  }, [safeProducts])

  // Extract available subcategories from products
  const availableSubcategories = useMemo(() => {
    const subcategories = new Set<string>()
    safeProducts.forEach((p) => {
      if (p.subcategory) {
        subcategories.add(p.subcategory)
      }
    })
    return Array.from(subcategories).sort()
  }, [safeProducts])

  // Calculate visible subcategories based on container width
  const calculateVisibleSubcategories = useCallback(() => {
    if (availableSubcategories.length <= 1 || !subcategoriesContainerRef.current) {
      setVisibleSubcategoriesCount(availableSubcategories.length)
      return
    }

    const container = subcategoriesContainerRef.current
    if (!container) return

    // Get container bounds
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerLeft = containerRect.left
    
    // Only calculate if container has a valid width
    if (containerWidth <= 0) return

    // Count how many buttons are fully visible within the container bounds
    let visibleCount = 0
    
    for (let i = 0; i < availableSubcategories.length; i++) {
      const subcat = availableSubcategories[i]
      const button = subcategoryButtonRefs.current.get(subcat)
      
      if (button) {
        const buttonRect = button.getBoundingClientRect()
        const buttonRight = buttonRect.right
        const containerRight = containerLeft + containerWidth
        
        // Check if the button's right edge is fully within the container (with a small buffer)
        if (buttonRight <= containerRight + 1) {
          visibleCount = i + 1
        } else {
          // This button and all subsequent ones are cut off
          break
        }
      }
    }

    setVisibleSubcategoriesCount(visibleCount > 0 ? visibleCount : 1)
  }, [availableSubcategories])

  useLayoutEffect(() => {
    // Reset to show all initially so we can measure
    setVisibleSubcategoriesCount(null)
    
    // Use requestAnimationFrame to ensure layout is complete after showing all
    const rafId = requestAnimationFrame(() => {
      // Double RAF to ensure DOM has updated with all visible buttons
      requestAnimationFrame(() => {
        calculateVisibleSubcategories()
      })
    })
    return () => cancelAnimationFrame(rafId)
  }, [calculateVisibleSubcategories, showFilters, cardSize, filters.subcategories])

  // Recalculate on window resize and container size changes
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout | null = null
    
    const handleResize = () => {
      // Debounce resize handling
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        // Reset to show all, then calculate
        setVisibleSubcategoriesCount(null)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            calculateVisibleSubcategories()
          })
        })
      }, 50)
    }

    window.addEventListener('resize', handleResize)
    
    // Use ResizeObserver to watch for container size changes (more reliable than window resize)
    let resizeObserver: ResizeObserver | null = null
    if (subcategoriesContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize()
      })
      resizeObserver.observe(subcategoriesContainerRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (resizeObserver && subcategoriesContainerRef.current) {
        resizeObserver.unobserve(subcategoriesContainerRef.current)
      }
    }
  }, [calculateVisibleSubcategories])

  // Get visible subcategories
  const visibleSubcategories = useMemo(() => {
    return availableSubcategories.slice(0, visibleSubcategoriesCount || availableSubcategories.length)
  }, [availableSubcategories, visibleSubcategoriesCount])

  // Get min and max prices
  const priceRange = useMemo(() => {
    if (!safeProducts || safeProducts.length === 0) return [0, 1000] as [number, number]
    const prices = safeProducts.map((p) => p.price)
    if (prices.length === 0) return [0, 1000] as [number, number]
    return [Math.min(...prices), Math.max(...prices)] as [number, number]
  }, [safeProducts])

  // Initialize filters with price range
  useEffect(() => {
    if (priceRange[0] !== filters.priceRange[0] || priceRange[1] !== filters.priceRange[1]) {
      setFilters((prev) => ({
        ...prev,
        priceRange: [priceRange[0], priceRange[1]] as [number, number],
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange])

  // Toggle filter sidebar visibility
  const handleToggleFilters = () => {
    const isMobile = window.innerWidth < 1024 // lg breakpoint
    const willShowFilters = !showFilters
    
    if (willShowFilters && isMobile) {
      // Close all filter sections on mobile to keep it compact
      setExpandedSections({
        availability: false,
        price: false,
        color: false,
        size: false,
      })
      
      // Show filters first
      setShowFilters(true)
      
      // Then smoothly scroll to filters section after a brief delay
      setTimeout(() => {
        const filtersElement = document.querySelector('[data-filters-section]')
        if (filtersElement) {
          const offsetTop = filtersElement.getBoundingClientRect().top + window.pageYOffset - 20 // 20px offset from top
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          })
        }
      }, 100)
    } else {
      setShowFilters(willShowFilters)
    }
  }

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = safeProducts.filter((product) => {
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      // Size filter
      if (filters.sizes.length > 0) {
        const hasSize = product.size?.some((s) => filters.sizes.includes(s))
        if (!hasSize) return false
      }

      // Color filter
      if (filters.colors.length > 0) {
        if (!product.color || !filters.colors.includes(product.color)) return false
      }

      // Stock filter
      if (filters.inStockOnly && !product.inStock) return false

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) return false
      }

      // Subcategory filter
      if (filters.subcategories && filters.subcategories.length > 0) {
        if (!product.subcategory || !filters.subcategories.includes(product.subcategory)) return false
      }

      return true
    })

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'relevance':
        case 'newest':
        default:
          return 0 // Keep original order for newest/relevance
      }
    })

    return filtered
  }, [safeProducts, filters, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = enableInfiniteScroll
    ? filteredAndSortedProducts.slice(0, currentPage * itemsPerPage)
    : filteredAndSortedProducts.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy])

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [currentPage, totalPages])

  // Scroll to top on page change
  useEffect(() => {
    if (!enableInfiniteScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage, enableInfiniteScroll])

  // Normalize content slot positions to appear only after complete rows
  // Positions should be multiples of 4 + 1 (i.e., 5, 9, 13, 17, etc.)
  // This ensures content blocks only appear after complete rows and never break the grid
  const normalizedContentSlots = useMemo(() => {
    if (!contentSlots?.withinGrid) return undefined

    return {
      ...contentSlots,
      withinGrid: contentSlots.withinGrid.map((slot) => {
        // Calculate which complete row this should appear after
        // Position 5 = after row 1 (4 products), Position 9 = after row 2 (8 products), etc.
        // Formula: round down to nearest multiple of 4, then add 1
        const rowNumber = Math.floor((slot.position - 1) / 4)
        const normalizedPosition = rowNumber * 4 + 1
        
        // Warn in development if position was adjusted
        if (process.env.NODE_ENV === 'development' && slot.position !== normalizedPosition) {
          console.warn(
            `Content slot position ${slot.position} was normalized to ${normalizedPosition} to ensure it appears after a complete row (positions must be 5, 9, 13, 17, etc. - multiples of 4 + 1).`
          )
        }

        return {
          ...slot,
          position: normalizedPosition,
        }
      }),
    }
  }, [contentSlots])

  // Helper function to check if product has variants that require selection
  const hasVariants = (product: Product): boolean => {
    // Check if product has multiple sizes (more than 1 option)
    if (product.size && product.size.length > 1) {
      return true
    }
    // Check if product has multiple color variants (more than 1 option)
    if (product.colors && product.colors.length > 1) {
      return true
    }
    // Check if product has variants property indicating additional variants
    if (product.variants && product.variants > 0) {
      return true
    }
    return false
  }

  // Handlers
  const handleAddToCart = (product: Product, size?: string, color?: string) => {
    addToCart(product, 1, size, color)
  }

  const handleAddToCartSimple = (product: Product) => {
    addToCart(product, 1)
  }

  // Unified handler for Quick View/Quick Add
  const handleUnifiedAction = (product: Product) => {
    // Check if product is out of stock first
    if (!product.inStock) {
      setNotifyMeProduct(product)
      return
    }

    if (hasVariants(product)) {
      // Product has variants - open modal for variant selection
      setQuickViewProduct(product)
    } else {
      // No variants - add to cart directly
      handleAddToCartSimple(product)
    }
  }

  const handleNotifyMe = (email: string) => {
    // Handle notify me - could send to API
    console.log(`Notify ${email} when ${notifyMeProduct?.name} is available`)
    // You can add toast notification here
  }

  const handleAddToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id)
      }
      return [...prev, product.id]
    })
  }

  const handleSizeToggle = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }

  const handleColorToggle = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const clearFilters = () => {
    setFilters({
      priceRange: [priceRange[0], priceRange[1]] as [number, number],
      sizes: [],
      colors: [],
      categories: [],
      subcategories: [],
      inStockOnly: false,
    })
  }

  // Check if price range is at default
  const isPriceRangeDefault = useMemo(() => {
    return filters.priceRange[0] === priceRange[0] && filters.priceRange[1] === priceRange[1]
  }, [filters.priceRange, priceRange])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.sizes.length > 0) count += filters.sizes.length
    if (filters.colors.length > 0) count += filters.colors.length
    if (filters.categories.length > 0) count += filters.categories.length
    if (filters.subcategories.length > 0) count += filters.subcategories.length
    if (filters.inStockOnly) count += 1
    // Price range is considered active if it's not the full range
    if (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) count += 1
    return count
  }, [filters, priceRange])

  // Get active filters as chips data
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = []

    // Price range filter (only if not at default range)
    if (
      filters.priceRange[0] !== priceRange[0] ||
      filters.priceRange[1] !== priceRange[1]
    ) {
      chips.push({
        id: 'price-range',
        label: `$${Math.round(filters.priceRange[0])} - $${Math.round(filters.priceRange[1])}`,
        onRemove: () => {
          setFilters((prev) => ({
            ...prev,
            priceRange: [priceRange[0], priceRange[1]] as [number, number],
          }))
        },
      })
    }

    // Size filters
    filters.sizes.forEach((size) => {
      chips.push({
        id: `size-${size}`,
        label: size === 'S' ? 'Small' : size === 'M' ? 'Medium' : size === 'L' ? 'Large' : size === 'XL' ? 'Extra Large' : size,
        onRemove: () => handleSizeToggle(size),
      })
    })

    // Color filters
    filters.colors.forEach((color) => {
      chips.push({
        id: `color-${color}`,
        label: color.charAt(0).toUpperCase() + color.slice(1),
        onRemove: () => handleColorToggle(color),
      })
    })

    // Category filters
    filters.categories.forEach((category) => {
      chips.push({
        id: `category-${category}`,
        label: category,
        onRemove: () => handleCategoryToggle(category),
      })
    })

    // In stock only filter
    if (filters.inStockOnly) {
      chips.push({
        id: 'in-stock',
        label: 'In Stock Only',
        onRemove: () => {
          setFilters((prev) => ({
            ...prev,
            inStockOnly: false,
          }))
        },
      })
    }

    return chips
  }, [filters, priceRange])

  // Get header image based on subcategory
  const getHeaderImage = () => {
    if (headerImage) return headerImage
    
    const categoryImages: Record<string, string> = {
      'Women': '/images/hero/hero-collection.png',
      'Men': '/images/products/fusion-block-1.png',
      'Accessories': '/images/products/spiral-accent-1.png',
      'Geometric': '/images/products/pure-cube-white-1.png',
      'Abstract': '/images/products/flow-form-i-1.png',
      'Sets': '/images/products/vertical-set-1.png',
      'Modular': '/images/products/base-module-1.png',
      'Premium': '/images/products/signature-form-white-1.png',
    }
    
    return categoryImages[category] || '/images/hero/hero-collection.png'
  }

  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs = [
      { label: 'Home', href: '/' },
      { label: category, href: `/${category.toLowerCase()}` },
    ]
    
    if (subcategory) {
      crumbs.push({
        label: subcategory,
        href: `/${category.toLowerCase()}/${subcategory.toLowerCase()}`,
      })
    }
    
    return crumbs
  }, [category, subcategory])

  return (
    <div className="min-h-screen bg-white">
      {/* Beautiful Header Section */}
      <div className="relative h-[250px] md:h-[300px] lg:h-[350px] overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage
            src={getHeaderImage()}
            alt={subcategory ? `${category} ${subcategory}` : category}
            className="w-full h-full"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
        </div>
        
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 md:pb-10">
            <div className="max-w-2xl">
              <div className="inline-block mb-4">
                <span className="text-xs md:text-sm text-white/80 uppercase tracking-widest font-medium">
                  {category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-4 tracking-tight leading-tight">
                {subcategory || 'Collection'}
              </h1>
              <p className="text-base md:text-lg text-white/90 font-light max-w-xl">
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'} available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-brand-gray-500 mb-6">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>&gt;</span>}
              <a href={crumb.href} className="hover:text-brand-blue-500 transition-colors">
                {crumb.label}
              </a>
            </React.Fragment>
          ))}
        </nav>

        {/* Toolbar - Filters and Sort */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Top Row: Filters, Subcategories, Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left Side: Filters Button */}
            <button
              onClick={handleToggleFilters}
              className={`btn flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start order-2 sm:order-1 ${
                showFilters 
                  ? 'btn-primary' 
                  : 'btn-secondary'
              }`}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
              aria-pressed={showFilters}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="uppercase tracking-wide text-sm font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-2 bg-brand-blue-500 text-white text-xs font-semibold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Center: Subcategories - Only show if there are multiple subcategories */}
            {availableSubcategories.length > 1 && (
              <div 
                ref={subcategoriesContainerRef}
                className="flex items-center gap-2 flex-nowrap overflow-hidden order-3 sm:order-2 flex-1 min-w-0 justify-center sm:justify-start"
              >
                {availableSubcategories.map((subcat, index) => {
                  const isActive = filters.subcategories.includes(subcat)
                  const subcatProductCount = safeProducts.filter((p) => p.subcategory === subcat).length
                  
                  return (
                    <button
                      key={subcat}
                      ref={(el) => {
                        if (el) {
                          subcategoryButtonRefs.current.set(subcat, el)
                        } else {
                          subcategoryButtonRefs.current.delete(subcat)
                        }
                      }}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          subcategories: isActive
                            ? prev.subcategories.filter((s) => s !== subcat)
                            : [...prev.subcategories, subcat],
                        }))
                        setCurrentPage(1)
                      }}
                      style={{
                        visibility: visibleSubcategoriesCount === null || index < visibleSubcategoriesCount ? 'visible' : 'hidden',
                        position: visibleSubcategoriesCount !== null && index >= visibleSubcategoriesCount ? 'absolute' : 'relative',
                        pointerEvents: visibleSubcategoriesCount !== null && index >= visibleSubcategoriesCount ? 'none' : 'auto',
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-brand-blue-500 text-white shadow-sm'
                          : 'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'
                      }`}
                      aria-label={`Filter by ${subcat}`}
                      aria-pressed={isActive}
                    >
                      {subcat} {subcatProductCount > 0 && `(${subcatProductCount})`}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Right Side: Sort and Grid Size Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap sm:flex-nowrap order-1 sm:order-3">
            <label className="text-sm text-brand-gray-600 uppercase tracking-wide whitespace-nowrap">
              Sort by:
            </label>
            <div className="relative flex-1 sm:flex-initial min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none border border-brand-gray-300 px-3 sm:px-4 py-2 pr-8 sm:pr-10 text-sm text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500 uppercase tracking-wide rounded-lg cursor-pointer w-full min-w-[160px]"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-brand-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            
            {/* Card Size Toggle */}
            <div className="flex items-center border border-brand-gray-300 rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={() => setCardSize('big')}
                className={`px-2 sm:px-3 py-2 transition-colors ${
                  cardSize === 'big'
                    ? 'bg-brand-blue-500 text-white'
                    : 'bg-white text-brand-gray-600 hover:bg-brand-gray-50'
                }`}
                aria-label="Big cards view"
                title="Big cards"
              >
                {/* Large grid icon - 2x2 with bigger squares */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="8" height="8" strokeWidth="2" rx="1" />
                  <rect x="13" y="3" width="8" height="8" strokeWidth="2" rx="1" />
                  <rect x="3" y="13" width="8" height="8" strokeWidth="2" rx="1" />
                  <rect x="13" y="13" width="8" height="8" strokeWidth="2" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setCardSize('small')}
                className={`px-2 sm:px-3 py-2 transition-colors ${
                  cardSize === 'small'
                    ? 'bg-brand-blue-500 text-white'
                    : 'bg-white text-brand-gray-600 hover:bg-brand-gray-50'
                }`}
                aria-label="Small cards view"
                title="Small cards"
              >
                {/* Small grid icon - 3x3 with smaller squares */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                  <rect x="9.5" y="2" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                  <rect x="17" y="2" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                  <rect x="2" y="9.5" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                  <rect x="9.5" y="9.5" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                  <rect x="17" y="9.5" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                  <rect x="2" y="17" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                  <rect x="9.5" y="17" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                  <rect x="17" y="17" width="5" height="5" strokeWidth="1.5" rx="0.5" />
                </svg>
              </button>
            </div>
          </div>
          </div>
        </div>

        <div className={`flex flex-col lg:flex-row transition-all duration-300 ${showFilters ? 'gap-8' : 'lg:gap-0'}`}>
          {/* Filters Sidebar */}
          <aside
            data-filters-section
            className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
              showFilters 
                ? 'block opacity-100 translate-x-0 w-full lg:w-64 lg:max-w-64' 
                : 'hidden lg:block lg:opacity-0 lg:-translate-x-8 lg:pointer-events-none lg:w-0 lg:max-w-0 lg:overflow-hidden'
            }`}
          >
            <div className={`transition-opacity duration-200 ${
              showFilters ? 'opacity-100 delay-75' : 'lg:opacity-0'
            }`}>
            <div>
              <div className="space-y-4">
                {/* Shop by Availability */}
                <div className="bg-white border border-brand-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('availability')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray-50 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-brand-black">Shop by Availability</h3>
                    {expandedSections.availability ? (
                      <svg
                        className="w-5 h-5 text-brand-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-brand-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                  {expandedSections.availability && (
                    <div className="px-4 pb-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.inStockOnly}
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            if (isChecked && !selectedStore) {
                              // Open store locator if no store is selected
                              setShowStoreLocator(true)
                            }
                            setFilters((prev) => ({
                              ...prev,
                              inStockOnly: isChecked,
                            }))
                          }}
                          className="w-4 h-4 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500"
                        />
                        <span className="text-sm text-brand-black">
                          In stock at{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowStoreLocator(true)
                            }}
                            className="text-brand-blue-500 hover:underline"
                          >
                            {selectedStore ? selectedStore.name : 'Select Store'}
                          </button>
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Shop by Price */}
                <div className="bg-white border border-brand-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray-50 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-brand-black">Shop by Price</h3>
                    {expandedSections.price ? (
                      <svg
                        className="w-5 h-5 text-brand-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-brand-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                  {expandedSections.price && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Price Input Fields */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            min={priceRange[0]}
                            max={priceRange[1]}
                            value={Math.round(filters.priceRange[0])}
                            onChange={(e) => {
                              const value = Math.max(priceRange[0], Math.min(Number(e.target.value), filters.priceRange[1]))
                              setFilters((prev) => ({
                                ...prev,
                                priceRange: [value, prev.priceRange[1]],
                              }))
                            }}
                            className="w-full pl-7 pr-3 py-2 border border-brand-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-lg"
                            placeholder="Min"
                          />
                        </div>
                        <span className="text-sm text-brand-gray-600">to</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            min={priceRange[0]}
                            max={priceRange[1]}
                            value={Math.round(filters.priceRange[1])}
                            onChange={(e) => {
                              const value = Math.max(filters.priceRange[0], Math.min(Number(e.target.value), priceRange[1]))
                              setFilters((prev) => ({
                                ...prev,
                                priceRange: [prev.priceRange[0], value],
                              }))
                            }}
                            className="w-full pl-7 pr-3 py-2 border border-brand-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-lg"
                            placeholder="Min"
                          />
                        </div>
                      </div>

                      {/* Price Range Slider */}
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={priceRange[0]}
                          max={priceRange[1]}
                          value={filters.priceRange[1]}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: [prev.priceRange[0], Number(e.target.value)],
                            }))
                          }
                          className="w-full h-2 bg-brand-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((filters.priceRange[1] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%, #e5e7eb ${((filters.priceRange[1] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-brand-gray-600">
                          <span>${Math.round(filters.priceRange[0])}</span>
                          <span>${Math.round(filters.priceRange[1])}</span>
                        </div>
                      </div>

                      {/* Price Range Presets */}
                      <div className="space-y-2">
                        {[
                          { min: 0, max: 74, label: '$0 - $74' },
                          { min: 74, max: 150, label: '$74 - $150' },
                        ].map((range) => {
                          const count = getPriceRangeCount(range.min, range.max)
                          return (
                            <label key={range.label} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  filters.priceRange[0] === range.min && filters.priceRange[1] === range.max
                                }
                                onChange={() =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    priceRange: [range.min, range.max] as [number, number],
                                  }))
                                }
                                className="w-4 h-4 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500"
                              />
                              <span className="text-sm text-brand-black">
                                {range.label} ({count})
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Shop by Color */}
                {availableColors.length > 0 && (
                  <div className="bg-white border border-brand-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('color')}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray-50 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-brand-black">Shop by Color</h3>
                      {expandedSections.color ? (
                        <svg
                          className="w-5 h-5 text-brand-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-brand-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                    {expandedSections.color && (
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-4 gap-3">
                          {availableColors.map((color) => {
                            const count = getColorCount(color)
                            const colorMap: Record<string, string> = {
                              blue: '#3b82f6',
                              black: '#000000',
                              white: '#ffffff',
                              red: '#ef4444',
                              green: '#22c55e',
                              yellow: '#eab308',
                              pink: '#ec4899',
                              purple: '#a855f7',
                              orange: '#f97316',
                              brown: '#a16207',
                              gray: '#6b7280',
                              grey: '#6b7280',
                              khaki: '#c3b091',
                              neon: '#ccff00',
                            }
                            const colorLower = color.toLowerCase()
                            const isSelected = filters.colors.includes(color)
                            const isPrinted = colorLower === 'printed'
                            
                            return (
                              <button
                                key={color}
                                onClick={() => handleColorToggle(color)}
                                className="flex flex-col items-center gap-2 group"
                              >
                                {isPrinted ? (
                                  <div
                                    className={`w-10 h-10 rounded-full border-2 transition-all bg-gradient-to-br from-purple-400 via-blue-400 to-white ${
                                      isSelected
                                        ? 'border-brand-blue-500 ring-2 ring-brand-blue-200'
                                        : 'border-brand-gray-300 group-hover:border-brand-gray-400'
                                    }`}
                                  />
                                ) : (
                                  <div
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                                      isSelected
                                        ? 'border-brand-blue-500 ring-2 ring-brand-blue-200'
                                        : 'border-brand-gray-300 group-hover:border-brand-gray-400'
                                    }`}
                                    style={{ backgroundColor: colorMap[colorLower] || '#cccccc' }}
                                  />
                                )}
                                <div className="text-center">
                                  <p className="text-xs font-medium text-brand-black capitalize">{color}</p>
                                  <p className="text-xs text-brand-gray-500">({count})</p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Shop by Size */}
                {availableSizes.length > 0 && (
                  <div className="bg-white border border-brand-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('size')}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray-50 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-brand-black">Shop by Size</h3>
                      {expandedSections.size ? (
                        <svg
                          className="w-5 h-5 text-brand-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-brand-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                    {expandedSections.size && (
                      <div className="px-4 pb-4">
                        <div className="space-y-2">
                          {availableSizes.map((size) => {
                            const count = getSizeCount(size)
                            return (
                              <label key={size} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.sizes.includes(size)}
                                  onChange={() => handleSizeToggle(size)}
                                  className="w-4 h-4 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500"
                                />
                                <span className="text-sm text-brand-black">
                                  {size === 'S' ? 'Small' : size === 'M' ? 'Medium' : size === 'L' ? 'Large' : size === 'XL' ? 'Extra Large' : size} ({count})
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1 transition-all duration-300">

            {/* Applied Filters Chip Bar */}
            {activeFilterChips.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-brand-gray-600 uppercase tracking-wide mr-1">
                    Applied Filters:
                  </span>
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.id}
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-gray-100 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-200 transition-colors"
                      aria-label={`Remove ${chip.label} filter`}
                    >
                      <span>{chip.label}</span>
                      <svg
                        className="w-4 h-4 text-brand-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brand-gray-600 hover:text-brand-black underline ml-2"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Content Slot Above Grid */}
            {contentSlots?.aboveGrid && (
              <div className="mb-8">{contentSlots.aboveGrid}</div>
            )}

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <>
                <div className={`grid [grid-auto-flow:dense] transition-all duration-300 ${
                  cardSize === 'small'
                    ? showFilters
                      ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                      : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                    : showFilters
                      ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
                      : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                }`}>
                  {(() => {
                    // Build a flat array of all grid items (products + content blocks) in order
                    // Track grid position to ensure items fill rows sequentially without gaps
                    const gridItems: Array<{ 
                      type: 'product' | 'content'
                      data: any
                      key: string
                      columnSpan: number // Track column span for grid position calculation
                    }> = []

                    // First, build the array with all items
                    paginatedProducts.forEach((product, index) => {
                      const productPosition = index + 1
                      const contentSlot = normalizedContentSlots?.withinGrid?.find(
                        (slot) => slot.position === productPosition
                      )

                      // Insert content block before the product if it exists at this position
                      if (contentSlot) {
                        const getColumnSpan = (columns?: 1 | 2 | 3 | 4 | 'full') => {
                          if (columns === 'full' || columns === 4) return 4
                          if (columns === 2) return 2
                          if (columns === 3) return 3
                          return 1
                        }
                        
                        gridItems.push({
                          type: 'content',
                          data: contentSlot,
                          key: `content-${productPosition}`,
                          columnSpan: getColumnSpan(contentSlot.columns),
                        })
                      }

                      // Add the product (always 1 column)
                      gridItems.push({
                        type: 'product',
                        data: product,
                        key: product.id,
                        columnSpan: 1,
                      })
                    })

                    // Render all grid items
                    return gridItems.map((item) => {
                      if (item.type === 'content') {
                        const contentSlot = item.data
                        const getColumnSpan = (columns?: 1 | 2 | 3 | 4 | 'full') => {
                          if (cardSize === 'small') {
                            // Small cards: more columns available
                            if (columns === 'full' || columns === 4) {
                              return 'col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6'
                            }
                            if (!columns || columns === 1) {
                              return 'col-span-1'
                            }
                            if (columns === 2) {
                              return 'col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-2'
                            }
                            if (columns === 3) {
                              return 'col-span-3 md:col-span-3 lg:col-span-3 xl:col-span-3'
                            }
                            return 'col-span-1'
                          } else {
                            // Big cards: original logic
                            if (columns === 'full' || columns === 4) {
                              // Full-width: span all columns (dense flow will handle placement)
                              return showFilters 
                                ? 'col-span-2 lg:col-span-3 xl:col-span-3'
                                : 'col-span-2 lg:col-span-3 xl:col-span-4'
                            }
                            if (!columns || columns === 1) {
                              return 'col-span-1'
                            }
                            if (columns === 2) {
                              return 'col-span-2 lg:col-span-2 xl:col-span-2'
                            }
                            if (columns === 3) {
                              return 'col-span-2 lg:col-span-3 xl:col-span-3'
                            }
                            return 'col-span-1'
                          }
                        }

                        return (
                          <div key={item.key} className={getColumnSpan(contentSlot.columns)}>
                            {contentSlot.content}
                          </div>
                        )
                      } else {
                        return (
                          <ProductCard
                            key={item.key}
                            product={item.data}
                            onUnifiedAction={handleUnifiedAction}
                            onAddToWishlist={handleAddToWishlist}
                          />
                        )
                      }
                    })
                  })()}
                </div>

                {/* Pagination */}
                {!enableInfiniteScroll && totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-brand-gray-300 text-brand-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-gray-50 transition-colors rounded-lg"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border transition-colors rounded-lg ${
                              currentPage === page
                                ? 'bg-brand-blue-500 text-white border-brand-blue-500'
                                : 'border-brand-gray-300 text-brand-black hover:bg-brand-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-brand-gray-400">...</span>
                      }
                      return null
                    })}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-brand-gray-300 text-brand-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-gray-50 transition-colors rounded-lg"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Infinite Scroll Load More */}
                {enableInfiniteScroll && currentPage < totalPages && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-3 bg-brand-blue-500 text-white font-medium uppercase tracking-wide hover:bg-brand-blue-600 transition-colors rounded-lg"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                {/* Search/Filter Icon */}
                <div className="mb-6 relative">
                  <svg 
                    className="w-24 h-24 text-brand-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
                
                {/* Friendly Message */}
                <h3 className="text-2xl font-semibold text-brand-black mb-3">
                  No products found
                </h3>
                <p className="text-sm text-brand-gray-600 mb-8 max-w-md">
                  We couldn&apos;t find any products matching your current filters. Try adjusting your search criteria or clear all filters to see more options.
                </p>
                
                {/* CTA Button */}
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          allProducts={safeProducts}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onNotify={(product) => setNotifyMeProduct(product)}
        />
      )}

      {/* Store Locator Modal */}
      <StoreLocatorModal
        isOpen={showStoreLocator}
        onClose={() => setShowStoreLocator(false)}
        onSelectStore={(store) => {
          setSelectedStore({
            id: store.id,
            name: store.name,
            address: store.address,
          })
          setShowStoreLocator(false)
        }}
        productName={category}
        selectedStoreId={selectedStore?.id}
      />

      {/* Notify Me Modal */}
      {notifyMeProduct && (
        <NotifyMeModal
          product={notifyMeProduct}
          isOpen={!!notifyMeProduct}
          onClose={() => setNotifyMeProduct(null)}
          onNotify={handleNotifyMe}
        />
      )}
    </div>
  )
}

