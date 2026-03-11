import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const collections = [
  {
    slug: "detty-december",
    name: "DETTY DECEMBER Picks",
    description: "Party season essentials curated for TORÉA.",
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "Latest ready-to-wear additions.",
  },
  {
    slug: "everyday-edit",
    name: "Everyday Edit",
    description: "Core pieces for day-to-day styling.",
  },
];

const products = [
  {
    slug: "dream-club-black",
    name: "TORÉA Island Dream Club T-shirt in black",
    description: "Premium cotton jersey tee with editorial minimal branding.",
    sku: "TOREA-001-BLK-M",
    size: "M",
    color: "Black",
    priceKobo: 4000000,
    stock: 25,
    collectionSlugs: ["detty-december", "new-arrivals"],
  },
  {
    slug: "earth-fingerprint-ecru",
    name: "TORÉA Earth Fingerprint T-shirt in ecru",
    description: "Soft-touch ecru t-shirt with statement front artwork.",
    sku: "TOREA-002-ECR-M",
    size: "M",
    color: "Ecru",
    priceKobo: 4000000,
    stock: 20,
    collectionSlugs: ["detty-december"],
  },
  {
    slug: "dream-club-ecru",
    name: "TORÉA Dream Club T-shirt in soft ecru",
    description: "Relaxed fit tee for elevated day and evening styling.",
    sku: "TOREA-003-ECR-M",
    size: "M",
    color: "Soft Ecru",
    priceKobo: 4000000,
    stock: 21,
    collectionSlugs: ["detty-december"],
  },
  {
    slug: "atlas-washed-grey",
    name: "TORÉA Atlas T-shirt in washed grey",
    description: "Washed grey treatment with premium construction.",
    sku: "TOREA-004-GRY-M",
    size: "M",
    color: "Washed Grey",
    priceKobo: 4500000,
    stock: 16,
    collectionSlugs: ["detty-december", "new-arrivals"],
  },
  {
    slug: "destiny-print-black",
    name: "TORÉA Destiny print T-shirt in black",
    description: "Graphic black tee built for festive season looks.",
    sku: "TOREA-005-BLK-M",
    size: "M",
    color: "Black",
    priceKobo: 4000000,
    stock: 18,
    collectionSlugs: ["detty-december"],
  },
  {
    slug: "linen-shift-dress",
    name: "TORÉA Linen Shift Dress",
    description: "Breathable linen shift dress with clean structure.",
    sku: "TOREA-006-SND-M",
    size: "M",
    color: "Sand",
    priceKobo: 3250000,
    stock: 12,
    collectionSlugs: ["new-arrivals", "everyday-edit"],
  },
  {
    slug: "tailored-wide-leg-trouser",
    name: "TORÉA Tailored Wide Leg Trouser",
    description: "High-waist trouser with flowing leg silhouette.",
    sku: "TOREA-007-CRM-M",
    size: "M",
    color: "Cream",
    priceKobo: 2800000,
    stock: 14,
    collectionSlugs: ["everyday-edit"],
  },
  {
    slug: "adire-overshirt",
    name: "TORÉA Adire Overshirt",
    description: "Modern overshirt with adire-inspired print details.",
    sku: "TOREA-008-NVY-M",
    size: "M",
    color: "Navy",
    priceKobo: 4100000,
    stock: 15,
    collectionSlugs: ["new-arrivals"],
  },
  {
    slug: "satin-column-skirt",
    name: "TORÉA Satin Column Skirt",
    description: "Smooth satin skirt for day-to-night dressing.",
    sku: "TOREA-009-CHM-M",
    size: "M",
    color: "Champagne",
    priceKobo: 2600000,
    stock: 10,
    collectionSlugs: ["everyday-edit"],
  },
  {
    slug: "cropped-utility-jacket",
    name: "TORÉA Cropped Utility Jacket",
    description: "Boxy cropped jacket with subtle utility pockets.",
    sku: "TOREA-010-OLV-M",
    size: "M",
    color: "Olive",
    priceKobo: 5200000,
    stock: 9,
    collectionSlugs: ["new-arrivals"],
  },
  {
    slug: "pleated-midi-dress",
    name: "TORÉA Pleated Midi Dress",
    description: "Fluid pleats with elegant movement and shape.",
    sku: "TOREA-011-RSE-M",
    size: "M",
    color: "Rose",
    priceKobo: 5750000,
    stock: 8,
    collectionSlugs: ["detty-december"],
  },
  {
    slug: "sheer-overlay-top",
    name: "TORÉA Sheer Overlay Top",
    description: "Layering top with lightweight semi-sheer finish.",
    sku: "TOREA-012-BLK-M",
    size: "M",
    color: "Black",
    priceKobo: 2350000,
    stock: 17,
    collectionSlugs: ["everyday-edit"],
  },
  {
    slug: "textured-knit-set-top",
    name: "TORÉA Textured Knit Set Top",
    description: "Ribbed knit top designed to pair with matching skirt.",
    sku: "TOREA-013-MLK-M",
    size: "M",
    color: "Milk",
    priceKobo: 2950000,
    stock: 13,
    collectionSlugs: ["new-arrivals", "everyday-edit"],
  },
  {
    slug: "textured-knit-set-skirt",
    name: "TORÉA Textured Knit Set Skirt",
    description: "Matching knit skirt with body-skimming silhouette.",
    sku: "TOREA-014-MLK-M",
    size: "M",
    color: "Milk",
    priceKobo: 2900000,
    stock: 13,
    collectionSlugs: ["new-arrivals", "everyday-edit"],
  },
  {
    slug: "beaded-mini-bag",
    name: "TORÉA Beaded Mini Bag",
    description: "Evening mini bag with handcrafted beaded texture.",
    sku: "TOREA-015-BRN-ONE",
    size: "ONE",
    color: "Brown",
    priceKobo: 3800000,
    stock: 7,
    collectionSlugs: ["detty-december"],
  },
  {
    slug: "structured-kaftan",
    name: "TORÉA Structured Kaftan",
    description: "Cleanly structured kaftan with modern neckline.",
    sku: "TOREA-016-WHT-M",
    size: "M",
    color: "White",
    priceKobo: 6200000,
    stock: 6,
    collectionSlugs: ["detty-december", "new-arrivals"],
  },
  {
    slug: "linen-two-piece-set",
    name: "TORÉA Linen Two Piece Set",
    description: "Signature linen set with effortless premium fit.",
    sku: "TOREA-017-SGE-M",
    size: "M",
    color: "Sage",
    priceKobo: 6900000,
    stock: 11,
    collectionSlugs: ["new-arrivals", "everyday-edit"],
  },
];

async function main() {
  await prisma.collectionProduct.deleteMany();

  for (const item of collections) {
    await prisma.collection.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
      },
    });
  }

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        isActive: true,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        isActive: true,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: item.sku },
      update: {
        productId: product.id,
        size: item.size,
        color: item.color,
        priceKobo: item.priceKobo,
        stock: item.stock,
        allowBackorder: false,
      },
      create: {
        productId: product.id,
        sku: item.sku,
        size: item.size,
        color: item.color,
        priceKobo: item.priceKobo,
        stock: item.stock,
        allowBackorder: false,
      },
    });

    for (const collectionSlug of item.collectionSlugs) {
      const collection = await prisma.collection.findUnique({
        where: { slug: collectionSlug },
        select: { id: true },
      });

      if (!collection) {
        continue;
      }

      await prisma.collectionProduct.upsert({
        where: {
          collectionId_productId: {
            collectionId: collection.id,
            productId: product.id,
          },
        },
        update: {},
        create: {
          collectionId: collection.id,
          productId: product.id,
        },
      });
    }
  }

  console.info(`Seed completed: ${products.length} products created/updated.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
