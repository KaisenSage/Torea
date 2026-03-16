import dotenv from "dotenv";
dotenv.config();
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const merged = JSON.parse(fs.readFileSync('./data/merged-products.json', 'utf8'));

  for (const product of merged) {
    if (!product.product_id) {
      console.error('Skipping product with missing product_id:', product);
      continue;
    }
    console.log('Upserting product:', product);
    // Upsert product info
    // Clean price: remove commas and convert to number
    let priceValue = product.price;
    if (typeof priceValue === 'string') {
      priceValue = priceValue.replace(/,/g, '');
      priceValue = Number(priceValue);
    }

    const { error: productError } = await supabase
      .from('Product')
      .upsert([{ 
        id: product.product_id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        price: priceValue,
        stock: product.stock,
        sizes: product.sizes,
        colors: product.colors,
        material: product.material,
        careInstructions: product.careInstructions,
        updatedAt: new Date().toISOString()
      }], { onConflict: ['slug'] });
    if (productError) {
      console.error('Product upsert error:', product.product_id, productError);
      continue;
    }

    // Upsert images
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        const { error: imageError } = await supabase
          .from('ProductImage')
          .upsert([{
            productId: product.product_id,
            cloudflareImageId: img.cloudflareImageId,
            color: img.color,
          }], { onConflict: ['productId', 'cloudflareImageId'] });
        if (imageError) {
          console.error('Image upsert error:', img, imageError);
        } else {
          console.log('Upserted image for product', product.product_id, img.color);
        }
      }
    }
  }
}

main().catch(console.error);
