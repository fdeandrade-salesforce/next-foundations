-- Add is_base_product column to products table
-- This column marks which product is the "base" product for a product family
-- Color variants will have is_base_product = false

-- Add the column
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_base_product BOOLEAN DEFAULT true;

-- Create an index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_is_base_product ON products(is_base_product);

-- Update Pure Cube variants - white is the base product
UPDATE products SET is_base_product = true WHERE id = 'pure-cube-white';
UPDATE products SET is_base_product = false WHERE id IN ('pure-cube-black', 'pure-cube-gray');

-- Update Signature Form variants - silver is the base product (most shown)
UPDATE products SET is_base_product = true WHERE id = 'signature-form-silver';
UPDATE products SET is_base_product = false WHERE id IN ('signature-form-black', 'signature-form-white');

-- Update Spiral Accent variants
UPDATE products SET is_base_product = true WHERE id = 'spiral-accent';
UPDATE products SET is_base_product = false WHERE id IN ('spiral-accent-black', 'spiral-accent-white');

-- Update Vertical Set variants  
UPDATE products SET is_base_product = true WHERE id = 'vertical-set';
UPDATE products SET is_base_product = false WHERE id IN ('vertical-set-black', 'vertical-set-white');

-- Update Twin Towers variants
UPDATE products SET is_base_product = true WHERE id = 'twin-towers';
UPDATE products SET is_base_product = false WHERE id IN ('twin-towers-black', 'twin-towers-white');

-- For any other products, ensure they have a consistent colors array
-- Run this to find and update products with same name that need colors array populated

-- Update colors array on all products to include all colors from same-name products
-- This is a PostgreSQL-specific update using jsonb
DO $$
DECLARE
  product_name TEXT;
  color_array JSONB;
BEGIN
  FOR product_name IN 
    SELECT DISTINCT name FROM products WHERE name IN (
      SELECT name FROM products GROUP BY name HAVING COUNT(*) > 1
    )
  LOOP
    -- Get all colors for this product name
    SELECT jsonb_agg(DISTINCT color) INTO color_array
    FROM products 
    WHERE name = product_name AND color IS NOT NULL;
    
    -- Note: colors column doesn't exist in schema - this is informational only
    -- Colors are derived from product_variants or by querying same-name products
  END LOOP;
END $$;
