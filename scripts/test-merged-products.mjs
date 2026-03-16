import fs from 'fs';
// For testing: Load merged-products.json and log product info and images
const merged = JSON.parse(fs.readFileSync('./data/merged-products.json', 'utf8'));

console.log('Sample merged product:', merged[0]);
console.log('Total products:', merged.length);

// You can use this file to test reading and rendering merged data in your frontend
export default merged;
