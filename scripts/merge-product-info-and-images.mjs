import fs from 'fs';
import { parse } from 'csv-parse/sync';
// Downloaded CSVs from Google Sheets
// Diagnostic output will be placed after CSV parsing

const productInfoCsv = fs.readFileSync('./data/products-normalized.csv', 'utf8');
const productImagesCsv = fs.readFileSync('./data/product-images.csv', 'utf8');

// Diagnostic: print raw CSV content before parsing
console.log('Raw product-images.csv content:');
console.log(productImagesCsv);

const productInfo = parse(productInfoCsv, { columns: true, skip_empty_lines: true });
const productImages = parse(productImagesCsv, { columns: true, skip_empty_lines: true });

// Diagnostic: print unique product names from both CSVs
const normalizedProductNames = Array.from(new Set(productInfo.map(p => String(p['Product Name']).trim())));
const imageProductNames = Array.from(new Set(productImages.map(img => String(img.name).trim())));
console.log('Unique Product Names in products-normalized.csv:', normalizedProductNames);
console.log('Unique Product Names in product-images.csv:', imageProductNames);

// Normalize product_id and color for matching
// Removed unused 'normalize' function

// Use Product Name as product_id for matching
function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const merged = productInfo
  .filter(product => product['Product Name'])
  .map(product => {
    const product_id = slugify(String(product['Product Name']).trim());
    const images = productImages.filter(img => {
      const imgNameSlug = slugify(String(img.name).trim());
      return imgNameSlug === product_id;
    });
    // Diagnostic output
    console.log(`Product: ${product['Product Name']} | Slug: ${product_id}`);
    if (images.length === 0) {
      console.log('  No images matched.');
    } else {
      console.log(`  Matched images:`, images.map(img => ({ name: img.name, color: img.color, cloudflareImageId: img.cloudflareImageId, product_id: img.product_id })));
    }
    return {
      product_id,
      slug: product_id,
      name: product['Product Name'],
      description: product['Product Description (2–4 sentences)'],
      category: product['Category'],
      subcategory: product['Sub-category'],
      price: product['Price (₦)'],
      stock: product['Stock Quantity'],
      sizes: product['Available Sizes'],
      colors: product['Available Colors'],
      material: product['Material / Fabric'],
      careInstructions: product['Care Instructions'],
      images: images.map(img => ({
        cloudflareImageId: img.cloudflareImageId,
        color: img.color
      }))
    };
  });

fs.writeFileSync('./data/merged-products.json', JSON.stringify(merged, null, 2));
console.log('Merged product info and images written to data/merged-products.json');
