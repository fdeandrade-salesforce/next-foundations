import XLSX from 'xlsx';
import * as path from 'path';
import { getAllProducts } from './lib/products';

// Read the sample file to understand the structure (optional)
const sampleFile = path.join(__dirname, 'sampleCommerceProductImport.xlsx');
let sampleHeaders: string[] = [];

try {
  const sampleWorkbook = XLSX.readFile(sampleFile);
  const sampleSheet = sampleWorkbook.Sheets[sampleWorkbook.SheetNames[0]];
  const sampleData = XLSX.utils.sheet_to_json(sampleSheet, { header: 1 }) as any[][];
  
  if (sampleData.length > 0) {
    sampleHeaders = sampleData[0] as string[];
    console.log('Sample file headers:', sampleHeaders);
  }
} catch (error: any) {
  console.log('Could not read sample file, will use default structure:', error.message);
}

// Main async function
async function generateImport() {
  // Get all products
  const products = await getAllProducts();

  // Define headers matching sample structure + Market Street specific fields
const headers = [
  'Product Name',
  'Product Description',
  'SKU',
  'Product Type',
  'Product Code',
  'Product ExternalID',
  'Product ID',
  'Product Family',
  'Category 1',
  'Category 2',
  'Price (sale) USD',
  'Price (original) USD',
  'Brand',
  'Color',
  'Available Colors',
  'Size',
  'Available Sizes',
  'Stock Quantity',
  'In Stock',
  'Store Available',
  'Rating',
  'Review Count',
  'Is New',
  'Is Best Seller',
  'Is Limited Edition',
  'Is Online Only',
  'Promotional Message',
  'Variation AttributeSet',
  'Variation Attribute Name 1',
  'Variation Attribute Value 1',
  'Variation Attribute Name 2',
  'Variation Attribute Value 2',
  'Media Standard URL 1',
  'Media Standard Title 1',
  'Media Standard AltText 1',
  'Media Standard Thumbnail 1',
  'Media Standard URL 2',
  'Media Standard Title 2',
  'Media Standard AltText 2',
  'Media Standard Thumbnail 2',
  'Media Standard URL 3',
  'Media Standard Title 3',
  'Media Standard AltText 3',
  'Media Standard Thumbnail 3',
  'Media Standard URL 4',
  'Media Standard Title 4',
  'Media Standard AltText 4',
  'Media Standard Thumbnail 4',
  'Product isActive',
  'Slug en_US'
];

  // Convert products to rows matching sample structure
  const rows = products.map(product => {
  // Generate slug from product name and color
  const slugBase = product.name.toLowerCase().replace(/\s+/g, '-');
  const slug = product.color 
    ? `${slugBase}-${product.color.toLowerCase().replace(/\s+/g, '-')}`
    : slugBase;
  
  // Determine product type based on category
  const productType = product.category === 'Premium' ? 'Premium Product' 
    : product.category === 'Modular' ? 'Modular System'
    : product.category === 'Sets' ? 'Product Set'
    : 'Standard Product';
  
  // Build variation attributes
  const variationAttributes: string[] = [];
  if (product.color) variationAttributes.push('Color');
  if (product.size && product.size.length > 0) variationAttributes.push('Size');
  const variationAttributeSet = variationAttributes.length > 0 ? variationAttributes.join(',') : '';
  
  // Get images (up to 4)
  const images = product.images || [product.image].filter(Boolean);
  
  return {
    'Product Name': product.name + (product.color ? ` - ${product.color}` : ''),
    'Product Description': product.shortDescription || `${product.name} from Market Street's ${product.category} collection.`,
    'SKU': product.sku || product.id.toUpperCase().replace(/-/g, '_'),
    'Product Type': productType,
    'Product Code': product.sku || '',
    'Product ExternalID': product.id,
    'Product ID': product.id,
    'Product Family': product.category,
    'Category 1': product.category,
    'Category 2': product.subcategory,
    'Price (sale) USD': product.price,
    'Price (original) USD': product.originalPrice || product.price,
    'Brand': product.brand || 'Market Street',
    'Color': product.color || '',
    'Available Colors': product.colors ? product.colors.join(', ') : '',
    'Size': product.size && product.size.length > 0 ? product.size[0] : '',
    'Available Sizes': product.size ? product.size.join(', ') : '',
    'Stock Quantity': product.stockQuantity || 0,
    'In Stock': product.inStock ? 'Yes' : 'No',
    'Store Available': product.storeAvailable ? 'Yes' : 'No',
    'Rating': product.rating || '',
    'Review Count': product.reviewCount || '',
    'Is New': product.isNew ? 'Yes' : 'No',
    'Is Best Seller': product.isBestSeller ? 'Yes' : 'No',
    'Is Limited Edition': product.isLimitedEdition ? 'Yes' : 'No',
    'Is Online Only': product.isOnlineOnly ? 'Yes' : 'No',
    'Promotional Message': product.promotionalMessage || '',
    'Variation AttributeSet': variationAttributeSet,
    'Variation Attribute Name 1': product.color ? 'Color' : '',
    'Variation Attribute Value 1': product.color || '',
    'Variation Attribute Name 2': product.size && product.size.length > 0 ? 'Size' : '',
    'Variation Attribute Value 2': product.size && product.size.length > 0 ? product.size[0] : '',
    'Media Standard URL 1': images[0] || '',
    'Media Standard Title 1': `${product.name}${product.color ? ` - ${product.color}` : ''} - Main View`,
    'Media Standard AltText 1': `${product.name}${product.color ? ` in ${product.color}` : ''} - Main product image`,
    'Media Standard Thumbnail 1': images[0] || '',
    'Media Standard URL 2': images[1] || '',
    'Media Standard Title 2': images[1] ? `${product.name}${product.color ? ` - ${product.color}` : ''} - Alternate View 1` : '',
    'Media Standard AltText 2': images[1] ? `${product.name}${product.color ? ` in ${product.color}` : ''} - Alternate view` : '',
    'Media Standard Thumbnail 2': images[1] || '',
    'Media Standard URL 3': images[2] || '',
    'Media Standard Title 3': images[2] ? `${product.name}${product.color ? ` - ${product.color}` : ''} - Alternate View 2` : '',
    'Media Standard AltText 3': images[2] ? `${product.name}${product.color ? ` in ${product.color}` : ''} - Alternate view` : '',
    'Media Standard Thumbnail 3': images[2] || '',
    'Media Standard URL 4': images[3] || '',
    'Media Standard Title 4': images[3] ? `${product.name}${product.color ? ` - ${product.color}` : ''} - Alternate View 3` : '',
    'Media Standard AltText 4': images[3] ? `${product.name}${product.color ? ` in ${product.color}` : ''} - Alternate view` : '',
    'Media Standard Thumbnail 4': images[3] || '',
    'Product isActive': product.inStock ? 'Yes' : 'No',
    'Slug en_US': slug
  };
});

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

  // Set column widths for better readability
  const columnWidths = headers.map((header, index) => {
  // Set appropriate widths based on header type
  if (header.includes('Media') || header.includes('URL') || header.includes('Description')) {
    return { wch: 50 };
  }
  if (header.includes('Name') || header.includes('Title') || header.includes('AltText')) {
    return { wch: 30 };
  }
  if (header.includes('Price') || header.includes('SKU') || header.includes('ID') || header.includes('Code')) {
    return { wch: 20 };
  }
  if (header.includes('Category') || header.includes('Family') || header.includes('Type')) {
    return { wch: 18 };
  }
  if (header.includes('Color') || header.includes('Size') || header.includes('Brand')) {
    return { wch: 15 };
  }
  if (header.includes('Stock') || header.includes('Rating') || header.includes('Review')) {
    return { wch: 12 };
  }
  if (header.includes('Available') || header.includes('Variation')) {
    return { wch: 25 };
  }
    // Default width
    return { wch: 15 };
  });
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Write to file
  const outputFile = path.join(__dirname, 'market-street-product-import.xlsx');
  XLSX.writeFile(workbook, outputFile);

  console.log(`\n✅ Successfully generated ${outputFile}`);
  console.log(`📊 Total products exported: ${products.length}`);
  console.log(`\nProducts included:`);
  products.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}${p.color ? ` (${p.color})` : ''} - $${p.price} - SKU: ${p.sku || 'N/A'}`);
  });
}

// Run the async function
generateImport().catch(console.error);
