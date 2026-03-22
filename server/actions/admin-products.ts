
"use server";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/rbac";

// Update stock for a product variant (admin only)
export async function updateVariantStock(variantId: string, newStock: number) {
  await requireAdmin();
  return prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock },
  });
}

type CreateProductInput = {
  name: string;
  slug: string;
  description?: string;
};

export async function listAdminProducts() {
  await requireAdmin();

  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });
}

export async function createAdminProduct(input: CreateProductInput) {
  await requireAdmin();

  return prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
    },
  });
}
