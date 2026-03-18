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
        slug: product.slug,
        // ...add other fields as needed
      },
      create: {
        id: product.product_id,
        name: product.name,
        description: product.description,
        category: product.category,
        slug: product.slug,
        // ...add other fields as needed
      },
    });

    // For Charme set, remove all old images before inserting new ones
    if (product.product_id === "charme-set") {
      await prisma.productImage.deleteMany({ where: { productId: dbProduct.id } });
    }
    // Upsert images for this product
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        const color = img.color ? img.color.trim().toLowerCase() : null;
        // Try to find existing image by productId and cloudflareImageId
        const existingById = await prisma.productImage.findFirst({
          where: {
            productId: dbProduct.id,
            cloudflareImageId: img.cloudflareImageId,
          },
        });
        if (existingById) {
          await prisma.productImage.update({
            where: { id: existingById.id },
            data: {
              color: color,
              imageUrl: img.imageUrl,
              alt: img.alt || null,
              sortOrder: img.sortOrder || 0,
            },
          });
        } else {
          // Fallback: check by productId and color (for legacy/other updates)
          const existingByColor = color ? await prisma.productImage.findFirst({
            where: {
              productId: dbProduct.id,
              color: color,
            },
          }) : null;
          if (existingByColor) {
            await prisma.productImage.update({
              where: { id: existingByColor.id },
              data: {
                cloudflareImageId: img.cloudflareImageId,
                imageUrl: img.imageUrl,
                alt: img.alt || null,
                sortOrder: img.sortOrder || 0,
              },
            });
          } else {
            await prisma.productImage.create({
              data: {
                productId: dbProduct.id,
                color: color,
                cloudflareImageId: img.cloudflareImageId,
                imageUrl: img.imageUrl,
                alt: img.alt || null,
                sortOrder: img.sortOrder || 0,
              },
            });
          }
        }
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
