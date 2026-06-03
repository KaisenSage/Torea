import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=== All Products ===\n");

  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
    },
    orderBy: { createdAt: "asc" },
  });

  for (const product of products) {
    console.log(`📦 ${product.name}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Price: ₦${(product.price / 100).toLocaleString()}`);
    console.log(`   Stock: ${product.stock}`);
    console.log(`   Images: ${product.images.length}`);
    if (product.images.length > 0) {
      product.images.forEach((img) => {
        console.log(`     - ${img.altText}`);
      });
    }
    console.log(`   Variants: ${product.variants.length}`);
    if (product.variants.length > 0) {
      product.variants.forEach((v) => {
        console.log(
          `     - ${v.name}: ₦${(v.price / 100).toLocaleString()} x${v.stock}`
        );
      });
    }
    console.log("");
  }

  console.log(`Total: ${products.length} products\n`);
  await prisma.$disconnect();
}

main();
