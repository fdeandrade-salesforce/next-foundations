'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import SearchModal from './SearchModal'
import { useAgent } from '../context/AgentContext'
import AccountDropdown from './AccountDropdown'
import LoginModal from './LoginModal'
import LogoutConfirmationModal from './LogoutConfirmationModal'
import MiniCart, { CartItem } from './MiniCart'
import Toast from './Toast'
import { getCart, updateCartQuantity, removeFromCart, addToCart, updateCartItemFulfillment } from '../lib/cart'
import { getAllProducts } from '../lib/products'
import { logout } from '../lib/auth'
import { Product } from './ProductListingPage'

interface ExtendedCartItem extends CartItem {
  fulfillmentMethod?: 'pickup' | 'delivery'
  storeId?: string
  storeName?: string
  storeAddress?: string
  shippingAddress?: string
  isGift?: boolean
  isBOGO?: boolean
  bogoPromotionId?: string
  isAvailableAtStore?: boolean
}

interface NavItem {
  label: string
  href: string
  children?: {
    title?: string
    items: { label: string; href: string }[]
  }[]
  featuredImage?: string
  featuredLabel?: string
  featuredLink?: string
  className?: string
}

const navigationItems: NavItem[] = [
  {
    label: 'Women',
    href: '/women',
    children: [
      {
        title: 'Categories',
        items: [
          { label: 'All Women', href: '/women' },
          { label: 'Geometric', href: '/women/geometric' },
          { label: 'Abstract', href: '/women/abstract' },
          { label: 'Spheres', href: '/women/spheres' },
        ],
      },
      {
        title: 'Top Sellers',
        items: [
          { label: 'Signature Form', href: '/women?filter=bestseller' },
          { label: 'Pure Cube', href: '/women?filter=bestseller' },
          { label: 'Soft Sphere', href: '/women?filter=bestseller' },
        ],
      },
      {
        title: 'Collections',
        items: [
          { label: 'New Arrivals', href: '/women?filter=new' },
          { label: 'Limited Edition', href: '/women?filter=limited' },
          { label: 'Sets & Bundles', href: '/women/sets' },
        ],
      },
    ],
    featuredImage: '/images/products/signature-form-white-1.png',
    featuredLabel: 'New Arrivals',
    featuredLink: '/women?filter=new',
  },
  {
    label: 'Men',
    href: '/men',
    children: [
      {
        title: 'Categories',
        items: [
          { label: 'All Men', href: '/men' },
          { label: 'Geometric', href: '/men/geometric' },
          { label: 'Abstract', href: '/men/abstract' },
          { label: 'Cubes', href: '/men/cubes' },
        ],
      },
      {
        title: 'Top Sellers',
        items: [
          { label: 'Pure Cube Black', href: '/men?filter=bestseller' },
          { label: 'Fusion Prism', href: '/men?filter=bestseller' },
          { label: 'Vertical Set', href: '/men?filter=bestseller' },
        ],
      },
      {
        title: 'Collections',
        items: [
          { label: 'New Arrivals', href: '/men?filter=new' },
          { label: 'Essentials', href: '/men?filter=essentials' },
          { label: 'Premium', href: '/men/premium' },
        ],
      },
    ],
    featuredImage: '/images/products/pure-cube-black-1.png',
    featuredLabel: 'New Arrivals',
    featuredLink: '/men?filter=new',
  },
  {
    label: 'Accessories',
    href: '/accessories',
    children: [
      {
        title: 'Categories',
        items: [
          { label: 'All Accessories', href: '/accessories' },
          { label: 'Stands', href: '/accessories/stands' },
          { label: 'Display Cases', href: '/accessories/display-cases' },
        ],
      },
      {
        title: 'By Material',
        items: [
          { label: 'Wood', href: '/accessories?material=wood' },
          { label: 'Metal', href: '/accessories?material=metal' },
          { label: 'Glass', href: '/accessories?material=glass' },
        ],
      },
    ],
    featuredImage: '/images/products/vertical-set-1.png',
    featuredLabel: 'Complete Sets',
    featuredLink: '/accessories/sets',
  },
  { label: 'New Releases', href: '/new-releases' },
  { label: 'Sale', href: '/sale', className: 'text-brand-blue-500' },
]

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [expandedMobileItems, setExpandedMobileItems] = useState<Set<string>>(new Set())
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { openAgent } = useAgent()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<ExtendedCartItem[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [toastMessage, setToastMessage] = useState<string>('')
  const [showToast, setShowToast] = useState(false)
  const [cartIconPulse, setCartIconPulse] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isHoveringMinicartRef = useRef(false)

  // Store availability mapping - same logic as Cart page
  const getItemAvailability = (itemId: string, storeId: string, allPickupItems: CartItem[]): boolean => {
    if (storeId === '2') {
      const itemIndex = allPickupItems.findIndex(item => item.id === itemId)
      return itemIndex >= 2
    }
    return true
  }

  // Enrich cart items with fulfillment data
  const enrichCartItems = (items: CartItem[]): ExtendedCartItem[] => {
    const defaultStoreId = '1'
    const defaultStoreName = 'Dorchester'
    const defaultStoreAddress = '26 District Avenue, Dorchester, MA 02125'
    
    return items.map((item): ExtendedCartItem => {
      // Use stored fulfillmentMethod, default to 'delivery' if not set
      const fulfillmentMethod = item.fulfillmentMethod || 'delivery'
      const isPickup = fulfillmentMethod === 'pickup'
      
      // Get pickup items for availability check (only for pickup items)
      const pickupItems = items.filter(i => (i.fulfillmentMethod || 'delivery') === 'pickup')
      const isAvailable = isPickup ? getItemAvailability(item.id, item.storeId || defaultStoreId, pickupItems) : true
      
      return {
        ...item,
        fulfillmentMethod: fulfillmentMethod as 'pickup' | 'delivery',
        // Only set store info if it's pickup and not already set
        storeId: isPickup ? (item.storeId || defaultStoreId) : undefined,
        storeName: isPickup ? (item.storeName || defaultStoreName) : undefined,
        storeAddress: isPickup ? (item.storeAddress || defaultStoreAddress) : undefined,
        shippingAddress: !isPickup ? (item.shippingAddress || '478 Artisan Way, Somerville, MA 02145') : undefined,
        isAvailableAtStore: isPickup ? isAvailable : undefined,
      }
    })
  }

  // Load cart on mount and listen for updates
  useEffect(() => {
    const loadCart = () => {
      const items = getCart()
      const enrichedItems = enrichCartItems(items)
      setCartItems(enrichedItems)
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0))
    }

    loadCart()

    const handleCartUpdate = (e: CustomEvent<CartItem[]>) => {
      const enrichedItems = enrichCartItems(e.detail)
      setCartItems(enrichedItems)
      setCartCount(e.detail.reduce((sum, item) => sum + item.quantity, 0))
    }

    const handleItemAdded = (e: CustomEvent<{ product: any; item: CartItem; isNewItem: boolean }>) => {
      const { product, item, isNewItem } = e.detail
      // Clear any existing auto-close timeout
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current)
        autoCloseTimeoutRef.current = null
      }
      // Open minicart with animation
      setIsCartOpen(true)
      // Dispatch event with item ID for animation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('itemAddedToMiniCart', { 
          detail: { itemId: item.id }
        }))
      }
      // Show brief toast message (minicart will also show the product)
      setToastMessage(`${product.name} added to cart`)
      setShowToast(true)
      // Auto-close minicart after 3 seconds, but only if not hovering
      // Delay the check slightly to allow hover detection to initialize
      setTimeout(() => {
        // Check hover state before setting timeout
        if (!isHoveringMinicartRef.current) {
          autoCloseTimeoutRef.current = setTimeout(() => {
            // Double-check hover state before closing
            if (!isHoveringMinicartRef.current) {
              setIsCartOpen(false)
            }
            autoCloseTimeoutRef.current = null
          }, 3000)
        }
      }, 150)
      setCartIconPulse(true)
      setTimeout(() => setCartIconPulse(false), 600)
    }

    const handleMinicartHover = (e: CustomEvent<{ isHovering: boolean }>) => {
      isHoveringMinicartRef.current = e.detail.isHovering
      // If user starts hovering, cancel auto-close immediately
      if (e.detail.isHovering) {
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current)
          autoCloseTimeoutRef.current = null
        }
      }
    }

    // Guard for SSR - window not available during server-side rendering
    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
      window.addEventListener('itemAddedToCart', handleItemAdded as EventListener)
      window.addEventListener('minicartHover', handleMinicartHover as EventListener)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
        window.removeEventListener('itemAddedToCart', handleItemAdded as EventListener)
        window.removeEventListener('minicartHover', handleMinicartHover as EventListener)
      }
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current)
      }
    }
  }, [])

  // Load products for upsell
  useEffect(() => {
    const loadProducts = async () => {
      const products = await getAllProducts()
      setAllProducts(products)
    }
    loadProducts()
  }, [])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const activeNavItem = navigationItems.find(item => item.label === activeDropdown)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-brand-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <img 
              src="/images/logo.svg" 
              alt="Salesforce Foundations" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div
                key={item.label}
                onMouseEnter={() => item.children && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeDropdown === item.label
                      ? 'bg-brand-blue-500 text-white'
                      : item.className || 'text-brand-black hover:text-brand-gray-600'
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-brand-black hover:text-brand-gray-600 transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Agent/AI Assistant Button */}
            <button 
              onClick={() => openAgent()}
              className="p-2 text-brand-black hover:text-brand-blue-500 transition-colors"
              aria-label="Personal Assistant"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
              </svg>
            </button>
            
            {/* Account Dropdown */}
            <AccountDropdown 
              onOpenLogin={() => setIsLoginOpen(true)} 
              onLogout={() => setIsLogoutConfirmOpen(true)}
            />
            
            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`p-2 text-brand-black hover:text-brand-gray-600 transition-all relative ${
                cartIconPulse ? 'animate-pulse' : ''
              }`}
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-brand-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1 transition-transform ${
                  cartIconPulse ? 'scale-125' : ''
                }`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2 text-brand-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-brand-gray-200">
            {navigationItems.map((item) => {
              const isExpanded = expandedMobileItems.has(item.label)
              const hasChildren = item.children && item.children.length > 0
              
              return (
                <div key={item.label}>
                  {hasChildren ? (
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedMobileItems)
                        if (isExpanded) {
                          newExpanded.delete(item.label)
                        } else {
                          newExpanded.add(item.label)
                        }
                        setExpandedMobileItems(newExpanded)
                      }}
                      className={`w-full flex items-center justify-between py-3 px-4 text-brand-black hover:bg-brand-gray-50 transition-colors font-medium ${item.className || ''}`}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block py-3 px-4 text-brand-black hover:bg-brand-gray-50 transition-colors font-medium ${item.className || ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                  {hasChildren && isExpanded && (
                    <div className="pl-4 pb-2 bg-brand-gray-50">
                      {item.children?.flatMap((column) =>
                        column.items.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="block py-2 px-4 text-sm text-brand-gray-600 hover:text-brand-black transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mega Menu - Full Width, Outside the container */}
      {activeNavItem?.children && (
        <div 
          className="absolute left-0 right-0 top-full bg-white border-b border-brand-gray-200 shadow-lg overflow-hidden"
          onMouseEnter={() => handleMouseEnter(activeNavItem.label)}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            style={{
              animation: 'menuSlideDown 0.15s ease-out forwards'
            }}
          >
            <div className="flex">
              {/* Text Columns */}
              <div className="flex-1">
                <div className="flex gap-12">
                  {activeNavItem.children.map((column, idx) => (
                    <div key={idx} className="min-w-[140px]">
                      {column.title && (
                        <p className="text-xs font-semibold text-brand-gray-400 uppercase tracking-wider mb-3">
                          {column.title}
                        </p>
                      )}
                      <ul className="space-y-2">
                        {column.items.map((link) => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                              className="text-sm text-brand-black hover:text-brand-blue-500 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Featured Image */}
              {activeNavItem.featuredImage && (
                <Link
                  href={activeNavItem.featuredLink || activeNavItem.href}
                  className="relative w-56 h-40 bg-brand-gray-100 rounded-lg overflow-hidden group flex-shrink-0"
                  onClick={() => setActiveDropdown(null)}
                >
                  <img
                    src={activeNavItem.featuredImage}
                    alt={activeNavItem.featuredLabel || 'Featured'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {activeNavItem.featuredLabel && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white text-sm font-medium">
                        {activeNavItem.featuredLabel}
                      </p>
                    </div>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenAgent={() => openAgent()}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Mini Cart */}
      <MiniCart
        isOpen={isCartOpen}
        onClose={() => {
          // Clear auto-close timeout when manually closing
          if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current)
            autoCloseTimeoutRef.current = null
          }
          setIsCartOpen(false)
        }}
        items={cartItems}
        onUpdateQuantity={(itemId, quantity) => {
          // Find the current item to check its quantity
          const currentItem = cartItems.find(item => item.id === itemId)
          if (!currentItem) return
          
          // Count total items excluding surprise gifts
          const totalCartItems = cartItems
            .filter(item => !item.isSurpriseGift)
            .reduce((sum, item) => sum + item.quantity, 0)
          
          // If there's only 1 item total in cart and current quantity is 1,
          // and user clicks minus (which results in quantity staying at 1 due to Math.max),
          // remove it directly (no confirmation modal for MiniCart quick action)
          if (currentItem.quantity === 1 && totalCartItems === 1 && quantity === 1) {
            removeFromCart(itemId)
          } else {
            updateCartQuantity(itemId, quantity)
          }
        }}
        onRemoveItem={(itemId) => {
          removeFromCart(itemId)
        }}
        onCheckout={() => {
          setIsCartOpen(false)
          // TODO: Navigate to checkout page
          if (typeof window !== 'undefined') {
            window.location.href = '/checkout'
          }
        }}
        onContinueShopping={() => {
          setIsCartOpen(false)
        }}
        onViewCart={() => {
          setIsCartOpen(false)
          // TODO: Navigate to full cart page
          if (typeof window !== 'undefined') {
            window.location.href = '/cart'
          }
        }}
        onAddUpsellToCart={(product) => {
          addToCart(product, 1)
        }}
        upsellProduct={allProducts.length > 0 ? allProducts.find(p => p.isBestSeller && !cartItems.some(item => item.product.id === p.id)) : undefined}
        freeShippingThreshold={60}
        onStoreChange={(store) => {
          // Update cart items with new store info
          const pickupItems = cartItems.filter(item => item.fulfillmentMethod === 'pickup').map(item => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
            originalPrice: item.originalPrice,
          }))
          
          const updatedItems: ExtendedCartItem[] = cartItems.map(item => {
            if (item.fulfillmentMethod === 'pickup') {
              const isAvailable = getItemAvailability(item.id, store.id, pickupItems)
              return {
                ...item,
                storeId: store.id,
                storeName: store.name,
                storeAddress: store.address,
                isAvailableAtStore: isAvailable,
              }
            }
            return item
          })
          
          setCartItems(updatedItems)
        }}
        onFulfillmentChange={(itemId, method) => {
          const defaultStoreId = '1'
          const defaultStoreName = 'Dorchester'
          const defaultStoreAddress = '26 District Avenue, Dorchester, MA 02125'
          
          // Persist to localStorage
          if (method === 'pickup') {
            updateCartItemFulfillment(itemId, 'pickup', defaultStoreId, defaultStoreName, defaultStoreAddress)
          } else {
            updateCartItemFulfillment(itemId, 'delivery')
          }
          
          // Update local state
          const updatedItems: ExtendedCartItem[] = cartItems.map((item): ExtendedCartItem => {
            if (item.id === itemId) {
              if (method === 'pickup') {
                const pickupItems = cartItems.filter(i => i.fulfillmentMethod === 'pickup' || i.id === itemId)
                const isAvailable = getItemAvailability(itemId, defaultStoreId, pickupItems)
                return {
                  ...item,
                  fulfillmentMethod: 'pickup' as const,
                  storeId: defaultStoreId,
                  storeName: defaultStoreName,
                  storeAddress: defaultStoreAddress,
                  shippingAddress: undefined,
                  isAvailableAtStore: isAvailable,
                }
              } else {
                return {
                  ...item,
                  fulfillmentMethod: 'delivery' as const,
                  shippingAddress: '478 Artisan Way, Somerville, MA 02145',
                  storeId: undefined,
                  storeName: undefined,
                  storeAddress: undefined,
                  isAvailableAtStore: undefined,
                }
              }
            }
            return item
          })
          
          setCartItems(updatedItems)
        }}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          logout()
          setIsLogoutConfirmOpen(false)
          setToastMessage('You have been signed out')
          setShowToast(true)
          
          // Redirect to homepage if logging out from account pages
          if (pathname?.startsWith('/account')) {
            router.push('/')
          }
        }}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
        type="success"
      />
    </nav>
  )
}
