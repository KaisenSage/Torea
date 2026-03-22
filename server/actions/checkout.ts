"use server";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireSignedInUser } from "@/server/auth/rbac";
import { initializePaystackTransaction } from "@/server/services/paystack";

type CheckoutInput = {
  shipping: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    lga?: string;
  };
};

function generateOrderNumber() {
  return `TOREA-${Date.now()}`;
}


export async function createCheckoutSession(input: CheckoutInput) {
  const user = await requireSignedInUser();

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Stock validation: block checkout if any item exceeds current stock
  for (const item of cart.items) {
    if (!item.variant || item.variant.stock < item.quantity) {
      throw new Error(
        `Sorry, "${item.variant?.color || "Unknown"} ${item.variant?.size || ""}" is out of stock or not enough stock for your order.`
      );
    }
  }

  const subtotalKobo = cart.items.reduce(
    (acc: number, item: { quantity: number; variant: { priceKobo: number } }) =>
      acc + item.quantity * item.variant.priceKobo,
    0,
  );

  const shippingFeeKobo = input.shipping.state.toLowerCase() === "lagos" ? 250000 : 450000;
  const totalKobo = subtotalKobo + shippingFeeKobo;
  const reference = `psk_${randomUUID()}`;

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        status: "PENDING_PAYMENT",
        subtotalKobo,
        shippingFeeKobo,
        totalKobo,
        shippingFullName: input.shipping.fullName,
        shippingPhone: input.shipping.phone,
        shippingLine1: input.shipping.line1,
        shippingLine2: input.shipping.line2,
        shippingCity: input.shipping.city,
        shippingState: input.shipping.state,
        shippingLga: input.shipping.lga,
        items: {
          create: cart.items.map((item: { variant: { productId: string; priceKobo: number }; variantId: string; quantity: number }) => ({
            productId: item.variant.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPriceKobo: item.variant.priceKobo,
            totalPriceKobo: item.variant.priceKobo * item.quantity,
          })),
        },
      },
    });

    await tx.paymentTransaction.create({
      data: {
        provider: "PAYSTACK",
        reference,
        orderId: createdOrder.id,
        amountKobo: totalKobo,
        status: "INITIATED",
      },
    });

    return createdOrder;
  });

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/thank-you?reference=${reference}`;

  const initialized = await initializePaystackTransaction({
    email: user.email,
    amountKobo: totalKobo,
    reference,
    callbackUrl,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
  });

  return {
    authorizationUrl: initialized.authorization_url,
    reference: initialized.reference,
    orderId: order.id,
  };
}
