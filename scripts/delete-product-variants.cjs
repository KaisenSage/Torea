async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  await prisma.productVariant.deleteMany({});
  console.log("All ProductVariant records deleted.");

  await prisma.$disconnect();
}

main().catch(console.error);
