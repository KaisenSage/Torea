import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const oldSlugs = ["charme-set", "luxe-set", "skylar-set", "aero-sculpt-jumpsuit", "flexsuit", "corefit", "peak-fit", "bum-covers", "singlets", "elevate-jacket-long-hands", "vortex-compression", "quarter-zip-compression-training-top", "men-s-streetwear-track-pants", "basic-cotton-tops", "gym-shorts"];

async function main() {
  console.log("Deleting old products...");
  let deleted = 0;
  for (const slug of oldSlugs) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (product) {
      await prisma.collectionProduct.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      await prisma.product.delete({ where: { id      await prisma.product.delete({ where: { id      await prisma.product.delete({ where: { id      await prisma.product.deldu      await prisma.product.delete({ where: { deleted + " products! " + remaining + " products remaining");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
