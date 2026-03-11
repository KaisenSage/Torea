"use server";

import { prisma } from "@/server/db/prisma";
import { requireSignedInUser } from "@/server/auth/rbac";

export async function getOrCreateCart() {
  const user = await requireSignedInUser();

  return prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });
}

export async function addToCart(variantId: string, quantity = 1) {
  const user = await requireSignedInUser();

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
    create: {
      cartId: cart.id,
      variantId,
      quantity,
    },
  });
}

export async function removeFromCart(variantId: string) {
  const user = await requireSignedInUser();
  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      variantId,
    },
  });
}
