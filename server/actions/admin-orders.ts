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

export async function lookupAdminOrder(query: string) {
  await requireAdmin();

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return null;
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: normalizedQuery },
        { shippingPhone: normalizedQuery },
        { user: { email: normalizedQuery.toLowerCase() } },
        { payment: { reference: normalizedQuery } },
      ],
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      user: true,
      payment: true,
    },
  });

  const payment = await prisma.paymentTransaction.findUnique({
    where: { reference: normalizedQuery },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
          user: true,
        },
      },
    },
  });

  const webhook = await prisma.webhookEvent.findFirst({
    where: {
      provider: "PAYSTACK",
      eventId: normalizedQuery,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    query: normalizedQuery,
    order,
    payment,
    webhook,
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}
