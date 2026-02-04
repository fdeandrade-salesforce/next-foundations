-- Salesforce Foundations E-commerce Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PRODUCTS
-- ============================================================================

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  color TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  store_available BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_online_only BOOLEAN DEFAULT false,
  is_limited_edition BOOLEAN DEFAULT false,
  variants INTEGER DEFAULT 0,
  sku TEXT,
  short_description TEXT,
  discount_percentage INTEGER,
  percent_off INTEGER,
  promotional_message TEXT,
  description TEXT,
  key_benefits JSONB,
  ingredients JSONB,
  usage_instructions JSONB,
  care_instructions JSONB,
  technical_specs JSONB,
  scents JSONB,
  capacities JSONB,
  delivery_estimate TEXT,
  returns_policy TEXT,
  warranty TEXT,
  videos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_subcategory ON products(subcategory);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_products_is_best_seller ON products(is_best_seller);
CREATE INDEX idx_products_price ON products(price);

-- ============================================================================
-- PRODUCT VARIANTS (for colors, sizes, etc.)
-- ============================================================================

CREATE TABLE product_variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  sku TEXT,
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_color ON product_variants(color);
CREATE INDEX idx_product_variants_size ON product_variants(size);

-- ============================================================================
-- PRODUCT IMAGES
-- ============================================================================

CREATE TABLE product_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_variant_id ON product_images(variant_id);

-- ============================================================================
-- REVIEWS
-- ============================================================================

CREATE TABLE reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  date TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_verified ON reviews(verified);

-- ============================================================================
-- REVIEW IMAGES
-- ============================================================================

CREATE TABLE review_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  review_id TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_review_images_review_id ON review_images(review_id);

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE orders (
  order_number TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  method TEXT NOT NULL,
  amount TEXT NOT NULL,
  order_date TEXT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  promotions DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_info TEXT,
  shipping_address TEXT,
  shipping_method TEXT,
  delivery_date TEXT,
  tracking_number TEXT,
  carrier TEXT,
  carrier_tracking_url TEXT,
  is_bopis BOOLEAN DEFAULT false,
  pickup_location TEXT,
  pickup_address TEXT,
  pickup_date TEXT,
  pickup_ready_date TEXT,
  can_return BOOLEAN DEFAULT false,
  can_cancel BOOLEAN DEFAULT false,
  return_deadline TEXT,
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

CREATE TABLE order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_number TEXT NOT NULL REFERENCES orders(order_number) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  color TEXT,
  size TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  store TEXT,
  shipping_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_number ON order_items(order_number);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- SHIPPING GROUPS (for multi-shipment orders)
-- ============================================================================

CREATE TABLE shipping_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_number TEXT NOT NULL REFERENCES orders(order_number) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  store TEXT,
  status TEXT NOT NULL,
  tracking_number TEXT,
  carrier TEXT,
  carrier_tracking_url TEXT,
  delivery_date TEXT,
  shipping_method TEXT,
  shipping_address TEXT,
  pickup_location TEXT,
  pickup_address TEXT,
  pickup_date TEXT,
  pickup_ready_date TEXT,
  is_bopis BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipping_groups_order_number ON shipping_groups(order_number);
CREATE INDEX idx_shipping_groups_group_id ON shipping_groups(group_id);

-- ============================================================================
-- STORES
-- ============================================================================

CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  hours JSONB,
  status TEXT NOT NULL,
  distance DECIMAL(10, 2),
  pickup_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_state ON stores(state);

-- ============================================================================
-- ACCOUNT PROFILES
-- ============================================================================

CREATE TABLE account_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth TEXT,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_account_profiles_email ON account_profiles(email);

-- ============================================================================
-- ADDRESSES
-- ============================================================================

CREATE TABLE addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  customer_id TEXT NOT NULL REFERENCES account_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);
CREATE INDEX idx_addresses_is_default ON addresses(is_default);

-- ============================================================================
-- PAYMENT METHODS
-- ============================================================================

CREATE TABLE payment_methods (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  customer_id TEXT NOT NULL REFERENCES account_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  last_four TEXT NOT NULL,
  brand TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  billing_address_id TEXT REFERENCES addresses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);

-- ============================================================================
-- WISHLISTS
-- ============================================================================

CREATE TABLE wishlists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  customer_id TEXT NOT NULL REFERENCES account_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Wishlist',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wishlists_customer_id ON wishlists(customer_id);
CREATE INDEX idx_wishlists_is_default ON wishlists(is_default);

-- ============================================================================
-- WISHLIST ITEMS
-- ============================================================================

CREATE TABLE wishlist_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wishlist_id, product_id)
);

CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items(product_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Public read access for products, reviews, stores (anon users can read)
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read access for product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read access for reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read access for review_images" ON review_images FOR SELECT USING (true);
CREATE POLICY "Public read access for stores" ON stores FOR SELECT USING (true);

-- Users can only read their own orders, addresses, payment methods, wishlists
-- Note: In production, you'd use auth.uid() to check the authenticated user
-- For now, we'll allow read access (you can restrict this later with proper auth)
CREATE POLICY "Users can read their own orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Users can read their own order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Users can read their own shipping_groups" ON shipping_groups FOR SELECT USING (true);
CREATE POLICY "Users can read their own account_profiles" ON account_profiles FOR SELECT USING (true);
CREATE POLICY "Users can read their own addresses" ON addresses FOR SELECT USING (true);
CREATE POLICY "Users can read their own payment_methods" ON payment_methods FOR SELECT USING (true);
CREATE POLICY "Users can read their own wishlists" ON wishlists FOR SELECT USING (true);
CREATE POLICY "Users can read their own wishlist_items" ON wishlist_items FOR SELECT USING (true);
