import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const slugsToDelete = [
  "sheer-overlay-top",
  "pleated-midi-dress",
  "cropped-utility-jacket",
  "satin-column-skirt",
  "adire-overshirt",
  "tailored-wide-leg-trouser",
  "linen-shift-dress",
  "destiny-print-black",
  "atlas-washed-grey",
  "dream-club-ecru",
  "earth-fingerprint-ecru",
  "dream-club-black"
];

(async function() {
  console.log("Deleting 12 TORÉA products...\n");
  let deleted = 0;
  
  for (const slug of slugsToDelete) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (product) {
      await prisma.collectionProduct.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      await prisma.product.delete({ where: { id: product.id } });
      deleted++;
      console.log("✓ " + product.name);
    }
  }
  
  const remaining = await prisma.product.count();
  console.log("\n✅ Deleted " + deleted + " products!");
  console.log("📊 Total remaining: " + remaining + " products");
  
  await prisma.$disconnect();
})();
