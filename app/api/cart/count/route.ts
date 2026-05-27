import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/prisma";
import { getCartCookieCount } from "@/server/services/cart-cookie";

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

    if (count === 0) {
      const cookieCount = await getCartCookieCount();
      return NextResponse.json({ count: cookieCount }, { status: 200 });
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch {
    const count = await getCartCookieCount();
    return NextResponse.json({ count }, { status: 200 });
  }
}
