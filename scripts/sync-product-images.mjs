import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Read the product images CSV
  const csv = fs.readFileSync('./data/product-images.csv', 'utf8');
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  for (const row of records) {
    const { product_id, color, cloudflareImageId } = row;
    if (!product_id || !color || !cloudflareImageId) continue;

    // Find the product by ID
    const product = await prisma.product.findUnique({
      where: { id: product_id },
    });
    if (!product) {
      console.warn(`Product not found for id: ${product_id}`);
      continue;
    }

    // Upsert the ProductImage
    await prisma.productImage.upsert({
      where: {
        productId_color: {
          productId: product_id,
          color: color.trim().toLowerCase(),
        },
      },
      update: {
        cloudflareImageId,
      },
      create: {
        productId: product_id,
        color: color.trim().toLowerCase(),
        cloudflareImageId,
      },
    });
    console.log(`Synced image for product ${product_id} color ${color}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
