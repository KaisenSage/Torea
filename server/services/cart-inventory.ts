import { prisma } from "@/server/db/prisma";

export async function normalizeCartInventory(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: {
      id: true,
      items: {
        select: {
          id: true,
          quantity: true,
          variant: {
            select: {
              stock: true,
              allowBackorder: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return false;
  }

  let changed = false;

  for (const item of cart.items) {
    if (item.variant.allowBackorder) {
      continue;
    }

    const nextQuantity = Math.max(0, item.variant.stock);

    if (item.quantity <= nextQuantity) {
      continue;
    }

    changed = true;

    if (nextQuantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      continue;
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: nextQuantity },
    });
  }

  return changed;
}