import { Role } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/prisma";

export async function getCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (existing) {
    return existing;
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return null;
  }

  return prisma.user.create({
    data: {
      clerkId: userId,
      email,
      firstName: clerkUser?.firstName || null,
      lastName: clerkUser?.lastName || null,
      role: Role.CUSTOMER,
    },
  });
}

export async function requireSignedInUser() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  return dbUser;
}

export async function requireAdmin() {
  const dbUser = await requireSignedInUser();

  if (dbUser.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }

  return dbUser;
}
