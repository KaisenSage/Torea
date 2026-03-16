import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function toKobo(value) {
  const amount = Number(value ?? 0);
  return Math.round(amount * 100);
}

function toBool(value) {
  if (typeof value !== "string") {
    return false;
  }

  return ["true", "yes", "1"].includes(value.trim().toLowerCase());
}

async function main() {
  const csvFile = process.argv[2] || "data/products.csv";
  const absolutePath = path.resolve(process.cwd(), csvFile);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`CSV file not found: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  for (const row of rows) {
    const slug = row.slug;
    const productName = row.name;
    const sku = row.sku;

    if (!slug || !productName || !sku) {
      console.warn("Skipping row with missing slug/name/sku", row);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name: productName,
        description: row.description || null,
        isActive: toBool(row.isActive ?? "true"),
      },
      create: {
        slug,
        name: productName,
        description: row.description || null,
        isActive: toBool(row.isActive ?? "true"),
      },
    });

    const variant = await prisma.productVariant.upsert({
      where: { sku },
      update: {
        productId: product.id,
        size: row.size || null,
        color: row.color || null,
        priceKobo: toKobo(row.priceNgn),
        stock: Number(row.stock ?? 0),
        allowBackorder: toBool(row.allowBackorder),
      },
      create: {
        productId: product.id,
        sku,
        size: row.size || null,
        color: row.color || null,
        priceKobo: toKobo(row.priceNgn),
        stock: Number(row.stock ?? 0),
        allowBackorder: toBool(row.allowBackorder),
      },
    });

    const imageId = row.cloudflareImageId;
    if (imageId) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          cloudflareImageId: imageId,
          alt: row.imageAlt || productName,
          sortOrder: Number(row.imageSortOrder ?? 0),
        },
      });
    }
  }

  console.info(`Imported ${rows.length} rows from ${csvFile}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
