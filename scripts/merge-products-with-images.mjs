import fs from 'fs';
import { parse } from 'csv-parse/sync';
// Read product info
const productsCsv = fs.readFileSync('./data/products.csv', 'utf8');
const products = parse(productsCsv, { columns: true, skip_empty_lines: true });

// Read charme set images info
const charmeCsv = fs.readFileSync('./data/charme-set-images.csv', 'utf8');
const charmeImages = parse(charmeCsv, { columns: true, skip_empty_lines: true });

// Merge by product_id (as string)
const merged = products.map(product => {
  const images = charmeImages.filter(img => img.product_id === product.product_id);
  return { ...product, images };
});

console.log(merged);
