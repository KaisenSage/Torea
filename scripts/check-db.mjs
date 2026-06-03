import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const count = await prisma.product.count();
  console.log(`Database OK — ${count} product(s) found.`);
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Authentication") || message.includes("password authentication failed")) {
    console.error("Database auth failed — your Supabase password in .env is wrong.");
    console.error("Fix: Supabase Dashboard → Project Settings → Database → Reset database password");
    console.error("Then update DATABASE_URL and DIRECT_URL in .env and .env.local");
  } else if (message.includes("Can't reach")) {
    console.error("Database unreachable — check your internet and Supabase project is not paused.");
    console.error("Use the Transaction pooler URI (port 6543) for DATABASE_URL in .env.local");
  } else {
    console.error("Database check failed:", message);
  }

  process.exit(1);
} finally {
  await prisma.$disconnect();
}
