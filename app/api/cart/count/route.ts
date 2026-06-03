import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/prisma";
import { getCartCookieCount } from "@/server/services/cart-cookie";
import { normalizeCartInventory } from "@/server/services/cart-inventory";
import { syncCookieCartToDatabase } from "@/server/services/cart-sync";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    const count = await getCartCookieCount();
    return NextResponse.json({ count }, { status: 200 });
  }

  try {
    await syncCookieCartToDatabase(userId);

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      const count = await getCartCookieCount();
      return NextResponse.json({ count }, { status: 200 });
    }

    await normalizeCartInventory(dbUser.id);

    const cart = await prisma.cart.findUnique({
      where: { userId: dbUser.id },
      select: {
        items: {
          select: {
            quantity: true,
          },
        },
      },
    });

    const count =
      cart?.items.reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0,
      ) ?? 0;
    return NextResponse.json({ count }, { status: 200 });
  } catch {
    const count = await getCartCookieCount();
    return NextResponse.json({ count }, { status: 200 });
  }
}
