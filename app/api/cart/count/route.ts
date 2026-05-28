import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/prisma";
import { getCartCookieCount } from "@/server/services/cart-cookie";
import { mergeCartCookieIntoDatabase } from "@/server/services/cart-merge";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    const count = await getCartCookieCount();
    return NextResponse.json({ count }, { status: 200 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      const count = await getCartCookieCount();
      return NextResponse.json({ count }, { status: 200 });
    }

    await mergeCartCookieIntoDatabase(dbUser.id);

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
