import { applySkylarAndCharmeUpdates, prisma } from "./scripts/db-utils.mjs";

applySkylarAndCharmeUpdates()
  .catch((error) => {
    console.error(`\n✗ Update failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
