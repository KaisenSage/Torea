const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.productVariant.deleteMany({});
  console.log('All ProductVariant records deleted.');
}

main().finally(() => prisma.$disconnect());
