import { Role } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/prisma";

export async function getCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to find by Clerk ID first
  let existing = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (existing) {
    return existing;
  }

  // If not found, try to find by email (to avoid duplicate users)
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return null;
  }
  existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    // Optionally, update the clerkId if missing
    if (!existing.clerkId) {
      await prisma.user.update({
        where: { email },
        data: { clerkId: userId },
      });
      existing.clerkId = userId;
    }
    return existing;
  }

  // Otherwise, create new user
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
  const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (
    dbUser.role !== Role.ADMIN &&
    (adminEmails.length === 0 || !adminEmails.includes(dbUser.email))
  ) {
    throw new Error("Forbidden");
  }

  return dbUser;
}
