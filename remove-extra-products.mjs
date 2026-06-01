import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// These are the only 16 products that should exist
const allowedSlugs = [
  "dream-club-black",
  "earth-fingerprint-ecru",
  "dream-club-ecru",
  "atlas-washed-grey",
  "destiny-print-black",
  "linen-shift-dress",
  "tailored-wide-leg-trouser",
  "adire-overshirt",
  "satin-column-skirt",
  "cropped-utility-jacket",
  "pleated-midi-dress",
  "sheer-overlay-top",
  "textured-knit-set-top",
  "textured-knit-set-skirt",
  "beaded-mini-bag",
  "structured-kaftan",
];

async function main() {
  // Find all products not in the allowed list
  const allProducts = await prisma.product.findMany({
    select: { id: true, slug: true, name: true }
  });

  const toDelete = allProducts.filter(p => !allowedSlugs.includes(p.slug));

  console.log(`Found ${toDelete.length} products to remove:`);
  toDelete.forEach(p => console.log(`  - ${p.slug} (${p.name})`));

  if (toDelete.length > 0) {
    // Delete order items and variants first (fore    // Delete order items and variants firs of toDelete) {
      await prisma.orderI      await prisma.orderI      await prisma.orderIct.id }
      });
      
      await prisma.cartItem.deleteMany({
        where: {
          var          v         productId: product.id
          }
        }
      });
      
      await prisma.pr      await prismteMa      await prisma: { productId: product.id }
                             p   ma.productImage.dele                        { productId: product.id }
                         ait prisma.collectionProduct.                      here: { productId: product.id }
      });
      
      await prisma.product.delete({
        where: { id: product.id }
      });
    }

    console.log(`\n✓ Successfully removed ${toDelete.length} products`);
  } else {
    console.log("✓ Database is clean - no extra products found");
  }

  const remaining = await prisma.product.findMany({
    select: { slug:     select: { slug:     srder    select: { slug:     select: { slug:     srder    select: { slug:     select: { slug:     srder    selecorEach((p, i) => console.log(`  ${i + 1}. ${p.slug} - ${p.name}`));
}

main()
  .catch(e => {
      ns      ns      ns      ns      ns      n
  .finally(() => prisma.$disconnect());
