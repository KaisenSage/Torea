import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();
const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL;

async function main() {
  // Remove all order items and orders before deleting products
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  // Fetch CSV from Google Sheets
  const response = await fetch(csvUrl);
  const csv = await response.text();
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  // Map CSV records to product fields
  const products = records.slice(0, 16)
    .map((row, idx) => {
      const name = row['Product Name'] || '';
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
      const priceKoboRaw = (row['Price (₦)'] || '').replace(/[^\d]/g, '');
      const priceKobo = priceKoboRaw ? parseInt(priceKoboRaw) * 100 : null;
      const stock = parseInt(row['Stock Quantity'] || '0');
      const sku = slug ? `${slug}-v1` : `product-${idx+1}-v1`;
      return {
        name,
        slug,
        category: row['Category'] || '',
        subcategory: row['Sub-category'] || '',
        stockTotal: stock,
        description: row['Product Description (2–4 sentences)'] || '',
        keyFeatures: row['Key Features'] || '',
        availableSizes: row['Available Sizes'] || '',
        availableColors: row['Available Colors'] || '',
        material: row['Material / Fabric'] || '',
        careInstructions: row['Care Instructions'] || '',
        isActive: true,
        variants: {
          create: [
            priceKobo && name
              ? {
                  priceKobo,
                  stock,
                  sku,
                  size: null,
                  color: null,
                }
              : null,
          ].filter(Boolean),
        },
      };
    })
    .filter(
      (product) =>
        product.name &&
        product.variants.create.length > 0 &&
        product.variants.create[0].priceKobo &&
        !isNaN(product.variants.create[0].priceKobo)
    );

  // Seed products with variants
  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
