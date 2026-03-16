import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const merged = JSON.parse(fs.readFileSync('./data/merged-products.json', 'utf8'));

  for (const product of merged) {
    // Upsert product info
    const dbProduct = await prisma.product.upsert({
      where: { id: product.product_id },
      update: {
        name: product.name,
        description: product.description,
        category: product.category,
        // ...add other fields as needed
      },
      create: {
        id: product.product_id,
        name: product.name,
        description: product.description,
        category: product.category,
        // ...add other fields as needed
      },
    });

    // Upsert images for this product
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        await prisma.productImage.upsert({
          where: {
            productId_color: {
              productId: dbProduct.id,
              color: img.color.trim().toLowerCase(),
            },
          },
          update: {
            cloudflareImageId: img.cloudflareImageId,
          },
          create: {
            productId: dbProduct.id,
            color: img.color.trim().toLowerCase(),
            cloudflareImageId: img.cloudflareImageId,
          },
        });
      }
    }
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
