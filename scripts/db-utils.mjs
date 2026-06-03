import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const CLOUDFLARE_HASH = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;

export function toKobo(priceNgn) {
  const amount = Number(String(priceNgn).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid price: ${priceNgn}`);
  }
  return Math.round(amount * 100);
}

export function formatNairaFromKobo(priceKobo) {
  return `₦${(priceKobo / 100).toLocaleString("en-NG")}`;
}

export function buildImageDeliveryUrl(imageIdOrUrl) {
  const value = imageIdOrUrl?.trim();
  if (!value) {
    return null;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (!CLOUDFLARE_HASH) {
    return null;
  }
  return `https://imagedelivery.net/${CLOUDFLARE_HASH}/${value}/public`;
}

export async function findProductBySlug(slug, include = {}) {
  const normalized = slug?.trim();
  if (!normalized) {
    throw new Error("Product slug is required");
  }

  const product = await prisma.product.findUnique({
    where: { slug: normalized },
    include,
  });

  if (!product) {
    throw new Error(`Product not found for slug "${normalized}"`);
  }

  return product;
}

export function normalizeColor(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function variantMatchesColor(variant, colorLabel) {
  const target = normalizeColor(colorLabel);
  const variantColor = normalizeColor(variant.color);
  if (!target || !variantColor) {
    return false;
  }
  return (
    variantColor === target ||
    variantColor.includes(target) ||
    target.includes(variantColor)
  );
}

export async function upsertVariantImage({
  productId,
  variantId,
  imageIdOrUrl,
  alt,
  sortOrder = 0,
  color = null,
}) {
  const cloudflareImageId = imageIdOrUrl.trim();
  const imageUrl = buildImageDeliveryUrl(cloudflareImageId);

  const existingForVariant = await prisma.productImage.findFirst({
    where: {
      productId,
      variantId,
      cloudflareImageId,
    },
  });

  if (existingForVariant) {
    return prisma.productImage.update({
      where: { id: existingForVariant.id },
      data: {
        imageUrl,
        alt: alt || existingForVariant.alt,
        sortOrder,
        color,
      },
    });
  }

  const existingForProduct = await prisma.productImage.findFirst({
    where: { productId, cloudflareImageId },
  });

  if (existingForProduct) {
    throw new Error(
      `Image "${cloudflareImageId}" is already linked to this product. ` +
        `Use "Add Variant Images" to attach a different image, or update the existing row.`,
    );
  }

  return prisma.productImage.create({
    data: {
      productId,
      variantId,
      cloudflareImageId,
      imageUrl,
      alt,
      sortOrder,
      color,
    },
  });
}

export async function addImagesToColorVariants({
  slug,
  color,
  imageIdOrUrl,
  alt,
  sortOrder = 0,
}) {
  const product = await findProductBySlug(slug, {
    variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
  });

  const matchingVariants = product.variants
    .filter((variant) => variantMatchesColor(variant, color))
    .sort((a, b) => String(a.size).localeCompare(String(b.size)));

  if (matchingVariants.length === 0) {
    throw new Error(
      `No variants found for "${slug}" with color "${color}"`,
    );
  }

  const variant = matchingVariants[0];
  const image = await upsertVariantImage({
    productId: product.id,
    variantId: variant.id,
    imageIdOrUrl,
    alt: alt || `${product.name} - ${variant.color}`,
    sortOrder,
    color: variant.color,
  });

  return { product, variant, image };
}

export async function updateAllVariantPricesBySlug(slug, priceNgn) {
  const product = await findProductBySlug(slug, { variants: true });
  const priceKobo = toKobo(priceNgn);

  if (product.variants.length === 0) {
    throw new Error(
      `Product "${slug}" has no variants. Create variants before updating prices.`,
    );
  }

  const updated = await prisma.productVariant.updateMany({
    where: { productId: product.id },
    data: { priceKobo },
  });

  return { product, priceKobo, count: updated.count };
}

export async function ensureSkylarVariants(priceNgn = 25990) {
  const product = await findProductBySlug("skylar-set");
  const priceKobo = toKobo(priceNgn);
  const sizes = Array.isArray(product.availableSizes)
    ? product.availableSizes.map(String)
    : ["M", "L"];
  const colors = Array.isArray(product.availableColors)
    ? product.availableColors.map(String)
    : [];

  const created = [];

  for (const size of sizes) {
    for (const color of colors) {
      const sku = `skylar-set-${size}-${color}`.toLowerCase().replace(/\s+/g, "-");
      const variant = await prisma.productVariant.upsert({
        where: { sku },
        update: { priceKobo, color, size },
        create: {
          productId: product.id,
          sku,
          size,
          color,
          priceKobo,
          stock: 10,
        },
      });
      created.push(variant);
    }
  }

  return { product, variants: created, priceKobo };
}

const SKYLAR_COLOR_IMAGES = [
  { color: "nude", imageId: "a703b788-9853-4923-fc02-b0405ce4bb00" },
  { color: "grey", imageId: "10fc736c-ff95-4d2a-95e8-307deca8e500" },
  { color: "brown", imageId: "110ef12e-38da-457a-5392-4cc39cc87e00" },
  { color: "sage green", imageId: "d29240bd-025b-4624-b171-b974e8d7a200", match: ["mint green", "sage green"] },
  { color: "black", imageId: "4d8d0e9d-a4ba-4e67-bec7-9000259a9c00" },
  { color: "blue", imageId: "323f308b-e203-4d6b-a6b7-679feef89400", match: ["dark blue", "blue"] },
];

const CHARME_COLOR_IMAGES = [
  { color: "lavender", imageId: "d01984d8-a13b-4465-7fb1-281c3abd5c00" },
  { color: "black", imageId: "a8ac0d83-20cf-43fa-2a7d-7296e2c13a00" },
  { color: "green", imageId: "ef7ab0bc-b2b8-4b95-46a2-c8145d1f6f00", match: ["green", "mint green"] },
  { color: "light brown", imageId: "ee2cc381-237d-4218-8a22-cd6e265eac00", match: ["brown", "light brown"] },
];

async function attachColorImages(slug, colorImages, productName) {
  const product = await findProductBySlug(slug, {
    variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
  });

  const attached = [];

  for (const entry of colorImages) {
    const matchLabels = entry.match || [entry.color];
    const matchingVariants = product.variants
      .filter((variant) =>
        matchLabels.some((label) => variantMatchesColor(variant, label)),
      )
      .sort((a, b) => String(a.size).localeCompare(String(b.size)));

    if (matchingVariants.length === 0) {
      attached.push({ color: entry.color, status: "skipped", reason: "no matching variants" });
      continue;
    }

    // One image per color (linked to first size variant) due to unique productId+cloudflareImageId constraint.
    const variant = matchingVariants[0];
    const image = await upsertVariantImage({
      productId: product.id,
      variantId: variant.id,
      imageIdOrUrl: entry.imageId,
      alt: `${productName} - ${entry.color}`,
      sortOrder: 0,
      color: variant.color,
    });
    attached.push({
      color: entry.color,
      variantId: variant.id,
      sku: variant.sku,
      imageId: image.id,
      status: "ok",
    });
  }

  return attached;
}

export async function applySkylarAndCharmeUpdates() {
  console.log("\n=== Applying Skylar & Charme updates ===\n");

  const skylarVariants = await ensureSkylarVariants(25990);
  console.log(
    `✓ Skylar Set: ensured ${skylarVariants.variants.length} variant(s) at ${formatNairaFromKobo(skylarVariants.priceKobo)}`,
  );

  const skylarPrices = await updateAllVariantPricesBySlug("skylar-set", 25990);
  console.log(
    `✓ Skylar Set: updated ${skylarPrices.count} variant price(s) to ${formatNairaFromKobo(skylarPrices.priceKobo)}`,
  );

  const skylarImages = await attachColorImages(
    "skylar-set",
    SKYLAR_COLOR_IMAGES,
    "Skylar Set",
  );
  console.log(
    `✓ Skylar Set: processed ${skylarImages.filter((item) => item.status === "ok").length} variant image attachment(s)`,
  );

  const charmePrices = await updateAllVariantPricesBySlug("charme-set", 25990);
  console.log(
    `✓ Charme Set: updated ${charmePrices.count} variant price(s) to ${formatNairaFromKobo(charmePrices.priceKobo)}`,
  );

  const charmeImages = await attachColorImages(
    "charme-set",
    CHARME_COLOR_IMAGES,
    "Charme Set",
  );
  console.log(
    `✓ Charme Set: processed ${charmeImages.filter((item) => item.status === "ok").length} variant image attachment(s)`,
  );

  console.log("\n✅ All updates applied safely (upserts only, no deletes).\n");

  return {
    skylarVariants,
    skylarPrices,
    skylarImages,
    charmePrices,
    charmeImages,
  };
}
