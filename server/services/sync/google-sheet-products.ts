import { parse } from "csv-parse/sync";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";

type CsvRow = {
  slug?: string;
  imageUrl?: string;
  name?: string;
  description?: string;
  sku?: string;
  size?: string;
  color?: string;
  priceNgn?: string;
  stock?: string;
  allowBackorder?: string;
  isActive?: string;
  cloudflareImageId?: string;
  cloudflareImageId2?: string;
  cloudflareImageId3?: string;
  cloudflareImageId4?: string;
  cloudflareImageId5?: string;
  cloudflareImageId6?: string;
  imageAlt?: string;
  imageSortOrder?: string;
  category?: string;
  subcategory?: string;
  material?: string;
  careInstructions?: string;
  keyFeatures?: string;
  availableSizes?: string;
  availableColors?: string;
};

type NormalizedProductRow = {
  slug: string;
  imageUrl?: string;
  name: string;
  description: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceNgn: string;
  stock: string;
  allowBackorder: string;
  isActive: string;
  cloudflareImageId?: string;
  cloudflareImageId2?: string;
  cloudflareImageId3?: string;
   cloudflareImageId4?: string;
   cloudflareImageId5?: string;
   cloudflareImageId6?: string;
  imageAlt?: string;
  imageSortOrder?: string;
  category?: string;
  subcategory?: string;
  material?: string;
  careInstructions?: string;
  keyFeatures?: string[];
  availableSizes?: string[];
  availableColors?: string[];
};

function toKobo(value: string | undefined) {
  const amount = Number(value ?? 0);
  return Math.round(amount * 100);
}

function toInt(value: string | undefined, fallback = 0) {
  const result = Number(value ?? fallback);
  return Number.isFinite(result) ? result : fallback;
}

function toBool(value: string | undefined, fallback = false) {
  if (typeof value !== "string") {
    return fallback;
  }

  return ["true", "yes", "1"].includes(value.trim().toLowerCase());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizePrice(value: string | undefined) {
  if (!value) {
    return "0";
  }

  return value.replace(/[^\d.]/g, "");
}

function parseList(value: string | undefined) {
  if (!value) {
    return [] as string[];
  }

  return value
    .replace(/•/g, "\n")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNormalizedRows(csvText: string) {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];
}

function parseFormResponseRows(csvText: string) {
  const matrix = parse(csvText, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
  }) as string[][];

  if (matrix.length < 2) {
    return [] as NormalizedProductRow[];
  }

  const headers = matrix[0];
    const rows = matrix.slice(1); // Fixed parsing error: added missing ':' or corrected syntax
  const productNameIndexes = headers.reduce<number[]>((all, header, index) => {
    if (header === "Product Name") {
      all.push(index);
    }
    return all;
  }, []);

  const productRows: NormalizedProductRow[] = [];

  for (const row of rows) {
    for (let blockIndex = 0; blockIndex < productNameIndexes.length; blockIndex += 1) {
      const start = productNameIndexes[blockIndex];
      const end = productNameIndexes[blockIndex + 1] ?? headers.length;
      const sectionHeaders = headers.slice(start, end);
      const sectionValues = row.slice(start, end);

      const block = Object.fromEntries(sectionHeaders.map((header, index) => [header, sectionValues[index] || ""])) as Record<string, string>;
      const name = block["Product Name"]?.trim();
      if (!name) {
        continue;
      }

      const slug = slugify(name);
      const sizes = parseList(block["Available Sizes"]);
      const colors = parseList(block["Available Colors"]);

      productRows.push({
        slug,
        name,
        description: block["Product Description (2–4 sentences)"] || "",
        sku: `${slug}-default`,
        size: sizes[0] || null,
        color: colors[0] || null,
        priceNgn: normalizePrice(block["Price (₦)"]),
        stock: block["Stock Quantity"] || "0",
        allowBackorder: "false",
        isActive: "true",
        category: block["Category"] || "",
        subcategory: block["Sub-category"] || "",
        material: block["Material / Fabric"] || "",
        careInstructions: block["Care Instructions"] || "",
        keyFeatures: parseList(block["Key Features"]),
        availableSizes: sizes,
        availableColors: colors,
        imageUrl: block["Image URL"] || undefined,
      });
    }
  }

  return productRows;
}

function normalizeRows(csvText: string) {
  const firstLine = csvText.split(/\r?\n/, 1)[0] || "";

  if (firstLine.includes("Timestamp") && firstLine.includes("Business Name")) {
    return parseFormResponseRows(csvText);
  }

  return parseNormalizedRows(csvText).map((row) => ({
    slug: row.slug?.trim() || "",
    name: row.name?.trim() || "",
    description: row.description || "",
    sku: row.sku?.trim() || "",
    size: row.size || null,
    color: row.color || null,
    priceNgn: normalizePrice(row.priceNgn),
    stock: row.stock || "0",
    allowBackorder: row.allowBackorder || "false",
    isActive: row.isActive || "true",
    cloudflareImageId: row.cloudflareImageId,
    cloudflareImageId2: row.cloudflareImageId2,
    cloudflareImageId3: row.cloudflareImageId3,
    cloudflareImageId4: row.cloudflareImageId4,
    cloudflareImageId5: row.cloudflareImageId5,
    cloudflareImageId6: row.cloudflareImageId6,
    imageAlt: row.imageAlt,
    imageSortOrder: row.imageSortOrder,
    category: row.category || "",
    subcategory: row.subcategory || "",
    material: row.material || "",
    careInstructions: row.careInstructions || "",
    keyFeatures: parseList(row.keyFeatures),
    availableSizes: parseList(row.availableSizes),
    availableColors: parseList(row.availableColors),
    imageUrl: row.imageUrl || undefined,
  }));
}

export async function syncProductsFromGoogleSheetCsv(csvUrl: string) {
  const response = await fetch(csvUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to download sheet CSV (status ${response.status})`);
  }

  const csvText = await response.text();
  const rows = normalizeRows(csvText);

  let processed = 0;
  let skipped = 0;

  for (const row of rows) {
    const slug = row.slug?.trim();
    const productName = row.name?.trim();
    const sku = row.sku?.trim();

    if (!slug || !productName || !sku) {
      skipped += 1;
      continue;
    }

    const productPayload = {
      name: productName,
      description: row.description || null,
      isActive: toBool(row.isActive, true),
      category: row.category || null,
      subcategory: row.subcategory || null,
      material: row.material || null,
      careInstructions: row.careInstructions || null,
      keyFeatures: row.keyFeatures?.length ? row.keyFeatures : null,
      availableSizes: row.availableSizes?.length ? row.availableSizes : null,
      availableColors: row.availableColors?.length ? row.availableColors : null,
      stockTotal: toInt(row.stock, 0),
    };

    const product = await prisma.product.upsert({
      where: { slug },
      update: productPayload as unknown as Prisma.ProductUpdateInput,
      create: {
        slug,
        ...productPayload,
      } as unknown as Prisma.ProductCreateInput,
    });

    const variant = await prisma.productVariant.upsert({
      where: { sku },
      update: {
        productId: product.id,
        size: row.size || null,
        color: row.color || null,
        priceKobo: toKobo(row.priceNgn),
        stock: toInt(row.stock, 0),
        allowBackorder: toBool(row.allowBackorder, false),
      },
      create: {
        productId: product.id,
        sku,
        size: row.size || null,
        color: row.color || null,
        priceKobo: toKobo(row.priceNgn),
        stock: toInt(row.stock, 0),
        allowBackorder: toBool(row.allowBackorder, false),
      },
    });

    const baseSortOrder = toInt(row.imageSortOrder, 0);
    const imageIds = [
      row.imageUrl?.trim(),
      row.cloudflareImageId?.trim(),
      row.cloudflareImageId2?.trim(),
      row.cloudflareImageId3?.trim(),
      row.cloudflareImageId4?.trim(),
      row.cloudflareImageId5?.trim(),
      row.cloudflareImageId6?.trim(),
    ].filter((value): value is string => Boolean(value));

    for (const [index, imageId] of imageIds.entries()) {
      const sortOrder = baseSortOrder + index;
            const imageData = {
              product: { connect: { id: product.id } },
              variant: { connect: { id: variant.id } },
              alt: row.imageAlt || productName,
              sortOrder,
              imageUrl: null as string | null,
              cloudflareImageId: null as string | null,
            };
      // If imageUrl is present, use it; else, use cloudflareImageId
      if (imageId && imageId.startsWith("http")) {
        imageData.imageUrl = imageId;
        imageData.cloudflareImageId = null;
      } else if (imageId) {
        imageData.cloudflareImageId = imageId;
        imageData.imageUrl = null;
      }
      const existingImage = await prisma.productImage.findFirst({
        where: {
          productId: product.id,
          variantId: variant.id,
          OR: [
            { imageUrl: imageData.imageUrl },
            { cloudflareImageId: imageData.cloudflareImageId },
          ],
        },
        select: { id: true },
      });
      if (existingImage) {
        await prisma.productImage.update({
          where: { id: existingImage.id },
          data: imageData,
        });
      } else {
        await prisma.productImage.create({
          data: imageData,
        });
      }
    }

    processed += 1;
  }

  return {
    processed,
    skipped,
    total: rows.length,
  };
}
