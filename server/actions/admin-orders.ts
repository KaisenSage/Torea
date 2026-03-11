"use server";

import { OrderStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth/rbac";

export async function listAdminOrders() {
  await requireAdmin();

  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: true,
      payment: true,
    },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}
