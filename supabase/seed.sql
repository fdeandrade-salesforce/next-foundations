-- Market Street E-commerce Seed Data
-- Run this in your Supabase SQL Editor after running schema.sql
-- This inserts sample data that matches the mock data structure

-- ============================================================================
-- PRODUCTS (5 products)
-- ============================================================================

INSERT INTO products (id, name, brand, price, original_price, image, category, subcategory, color, in_stock, stock_quantity, store_available, rating, review_count, is_new, is_best_seller, sku, short_description, promotional_message) VALUES
('pure-cube-white', 'Pure Cube', 'Market Street', 49.00, NULL, '/images/products/pure-cube-white-1.png', 'Geometric', 'Cubes', 'White', true, 24, true, 4.8, 45, true, false, 'PC-001-WHT', 'Minimalist cube design with perfect proportions.', 'Extra 20% Off with code WELCOME20'),
('pure-cube-black', 'Pure Cube', 'Market Street', 49.00, NULL, '/images/products/pure-cube-black-1.png', 'Geometric', 'Cubes', 'Black', false, 0, false, 4.9, 89, false, true, 'PC-002-BLK', 'Minimalist cube design with perfect proportions.', NULL),
('pure-cube-gray', 'Pure Cube', 'Market Street', 75.00, 89.00, '/images/products/pure-cube-gray-1.png', 'Geometric', 'Cubes', 'Gray', true, 8, true, 4.7, 56, false, false, 'PC-003-GRY', 'Minimalist cube design with perfect proportions.', NULL),
('solid-cylinder', 'Solid Cylinder', 'Market Street', 59.00, NULL, '/images/products/solid-cylinder-1.png', 'Geometric', 'Cylinders', NULL, true, 50, true, 4.6, 32, false, false, 'SC-001-NTR', 'Robust cylindrical form with timeless appeal.', NULL),
('steady-prism', 'Steady Prism', 'Market Street', 65.00, NULL, '/images/products/steady-prism-1.png', 'Geometric', 'Prisms', NULL, true, 15, true, 4.5, 28, true, false, 'SP-001-NTR', 'Elegant prismatic form with geometric precision.', NULL);

-- Product images
INSERT INTO product_images (product_id, image_url, image_order) VALUES
('pure-cube-white', '/images/products/pure-cube-white-1.png', 0),
('pure-cube-white', '/images/products/pure-cube-white-2.png', 1),
('pure-cube-white', '/images/products/pure-cube-white-3.png', 2),
('pure-cube-white', '/images/products/pure-cube-white-4.png', 3),
('pure-cube-black', '/images/products/pure-cube-black-1.png', 0),
('pure-cube-black', '/images/products/pure-cube-black-2.png', 1),
('pure-cube-gray', '/images/products/pure-cube-gray-1.png', 0),
('solid-cylinder', '/images/products/solid-cylinder-1.png', 0),
('steady-prism', '/images/products/steady-prism-1.png', 0);

-- ============================================================================
-- REVIEWS (5 reviews)
-- ============================================================================

INSERT INTO reviews (id, product_id, author, rating, date, title, content, verified, helpful) VALUES
('rev-1', 'pure-cube-white', 'Name A.', 5, 'June 2022', 'Excellent quality', 'Absolutely love this product! The quality is outstanding and it looks even better in person. Highly recommend to anyone looking for premium design.', true, 24),
('rev-2', 'pure-cube-white', 'Sarah M.', 4, 'May 2022', 'Great design', 'Beautiful geometric form that fits perfectly in my living space. The craftsmanship is impeccable. Only giving 4 stars because shipping took a bit longer than expected.', true, 18),
('rev-3', 'pure-cube-white', 'John D.', 5, 'April 2022', 'Perfect addition', 'Exactly what I was looking for. The minimalist design adds elegance to any room. Worth every penny!', false, 12),
('rev-4', 'pure-cube-black', 'Emma L.', 5, 'July 2022', 'Stunning piece', 'The black finish is absolutely gorgeous. It''s become the centerpiece of my home office. Highly recommend!', true, 31),
('rev-5', 'solid-cylinder', 'Michael R.', 4, 'August 2022', 'Great value', 'Solid construction and beautiful design. Great addition to my collection. Shipping was fast and packaging was excellent.', true, 15);

-- ============================================================================
-- STORES
-- ============================================================================

INSERT INTO stores (id, name, address, city, state, zip, phone, email, latitude, longitude, hours, status, distance, pickup_time) VALUES
('store-1', 'Market Street San Francisco', '415 Mission Street', 'San Francisco', 'CA', '94105', '(415) 555-0100', 'sf@marketstreet.com', 37.7749, -122.4194, '{"monday": "10:00-20:00", "tuesday": "10:00-20:00", "wednesday": "10:00-20:00", "thursday": "10:00-20:00", "friday": "10:00-21:00", "saturday": "10:00-21:00", "sunday": "11:00-19:00"}'::jsonb, 'open', 0.5, '2-3 hours'),
('store-2', 'Market Street New York', '123 Broadway', 'New York', 'NY', '10001', '(212) 555-0100', 'ny@marketstreet.com', 40.7128, -74.0060, '{"monday": "10:00-20:00", "tuesday": "10:00-20:00", "wednesday": "10:00-20:00", "thursday": "10:00-20:00", "friday": "10:00-21:00", "saturday": "10:00-21:00", "sunday": "11:00-19:00"}'::jsonb, 'open', 1.2, '3-4 hours');

-- ============================================================================
-- ACCOUNT PROFILES
-- ============================================================================

INSERT INTO account_profiles (id, email, first_name, last_name, phone) VALUES
('customer-1', 'customer@example.com', 'John', 'Doe', '+1-555-0100');

-- ============================================================================
-- ORDERS (2 orders)
-- ============================================================================

INSERT INTO orders (order_number, customer_id, status, method, amount, order_date, subtotal, promotions, shipping, tax, total, payment_info, shipping_address, shipping_method, delivery_date, tracking_number, carrier, carrier_tracking_url, can_return, can_cancel) VALUES
('INV001', 'customer-1', 'Partially Delivered', 'Credit Card', '$54.00', 'Sep 10, 2024', 60.00, -10.00, 0.00, 4.00, 54.00, 'VISA Ending in 1234', 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States', 'Free | Standard Shipping', 'Sep 15-16, 2024', '1Z999AA10123456784', 'UPS', 'https://www.ups.com/track?tracknum=1Z999AA10123456784', true, false),
('INV002', 'customer-1', 'Delivered', 'Credit Card', '$89.00', 'Aug 15, 2024', 75.00, 0.00, 5.00, 9.00, 89.00, 'VISA Ending in 1234', 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States', 'Standard Shipping', 'Aug 18, 2024', '1Z999AA10123456785', 'UPS', 'https://www.ups.com/track?tracknum=1Z999AA10123456785', false, false);

-- Order items for INV001
INSERT INTO order_items (order_number, product_id, product_name, product_image, quantity, color, size, price, original_price, store, shipping_group) VALUES
('INV001', 'pure-cube-white', 'Pure Cube', '/images/products/pure-cube-white-1.png', 3, 'Grey', 'XL', 15.00, 20.00, 'Market Street San Francisco', 'sf-store-address1'),
('INV001', 'steady-prism', 'Steady Prism', '/images/products/steady-prism-1.png', 2, 'Grey', 'XL', 15.00, 20.00, 'Market Street San Francisco', 'sf-store-address1'),
('INV001', 'solid-cylinder', 'Solid Cylinder', '/images/products/solid-cylinder-1.png', 1, 'Grey', 'XL', 15.00, 20.00, 'Market Street San Francisco', 'sf-store-address2');

-- Order items for INV002
INSERT INTO order_items (order_number, product_id, product_name, product_image, quantity, color, size, price, original_price, store) VALUES
('INV002', 'pure-cube-gray', 'Pure Cube', '/images/products/pure-cube-gray-1.png', 1, 'Gray', 'M', 75.00, 89.00, 'Market Street San Francisco');

-- Shipping groups for INV001
INSERT INTO shipping_groups (order_number, group_id, store, status, tracking_number, carrier, carrier_tracking_url, delivery_date, shipping_method, shipping_address) VALUES
('INV001', 'sf-store-address1', 'Market Street San Francisco', 'Delivered', '1Z999AA10123456784', 'UPS', 'https://www.ups.com/track?tracknum=1Z999AA10123456784', 'Sep 15, 2024', 'Standard Shipping', 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States'),
('INV001', 'sf-store-address2', 'Market Street San Francisco', 'In Transit', '1Z999AA10123456785', 'UPS', 'https://www.ups.com/track?tracknum=1Z999AA10123456785', 'Sep 20-22, 2024', 'Standard Shipping', 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States');

-- ============================================================================
-- ADDRESSES
-- ============================================================================

INSERT INTO addresses (customer_id, type, first_name, last_name, address_line1, city, state, zip, country, phone, is_default) VALUES
('customer-1', 'shipping', 'John', 'Doe', '415 Mission Street', 'San Francisco', 'CA', '94105', 'US', '+1-555-0100', true),
('customer-1', 'billing', 'John', 'Doe', '415 Mission Street', 'San Francisco', 'CA', '94105', 'US', '+1-555-0100', false);

-- ============================================================================
-- PAYMENT METHODS
-- ============================================================================

INSERT INTO payment_methods (customer_id, type, last_four, brand, expiry_month, expiry_year, is_default) VALUES
('customer-1', 'visa', '1234', 'Visa', 12, 2025, true);

-- ============================================================================
-- WISHLISTS
-- ============================================================================

INSERT INTO wishlists (customer_id, name, is_default) VALUES
('customer-1', 'My Wishlist', true);

-- Wishlist items
INSERT INTO wishlist_items (wishlist_id, product_id) 
SELECT w.id, 'pure-cube-black' FROM wishlists w WHERE w.customer_id = 'customer-1' AND w.is_default = true
UNION ALL
SELECT w.id, 'steady-prism' FROM wishlists w WHERE w.customer_id = 'customer-1' AND w.is_default = true;
