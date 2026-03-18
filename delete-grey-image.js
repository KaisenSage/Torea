const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.productImage.delete({
    where: {
      id: "83ce6bd4-574f-43d7-b36b9fada90"
    }
  });

  console.log("Grey image deleted ✅");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
