const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./data/merged-products.json', 'utf8'));
const rows = [];
for (const product of products) {
  // Parse sizes
  let sizes = Array.isArray(product.sizes)
    ? product.sizes
    : String(product.sizes).split(',').map(s => s.trim()).filter(Boolean);
  // Parse colors
  let colors = Array.isArray(product.colors)
    ? product.colors
    : String(product.colors).split(',').map(c => c.trim()).filter(Boolean);
  // If no sizes, use empty string
  if (sizes.length === 0) sizes = [''];
  // If no colors, use empty string
  if (colors.length === 0) colors = [''];
  for (const size of sizes) {
    for (const color of colors) {
      rows.push({
        productId: product.product_id,
        sku: `${product.product_id}-${size}-${color}`,
        size,
        color,
        priceNgn: product.price.replace(/,/g, ''),
        stock: product.stock || 10
      });
    }
  }
}
fs.writeFileSync('./data/auto-product-variants.csv', [
  'productId,sku,size,color,priceNgn,stock',
  ...rows.map(r => `${r.productId},${r.sku},${r.size},${r.color},${r.priceNgn},${r.stock}`)
].join('\n'));
console.log('auto-product-variants.csv generated with', rows.length, 'rows');
