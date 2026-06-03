import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { sendOrderConfirmationEmail } from "@/server/services/email";
import type { VerifyTransactionData } from "@/server/services/paystack";

export async function reserveOrderStock(
  tx: Prisma.TransactionClient,
  items: Array<{ variantId: string; quantity: number; allowBackorder: boolean }>,
) {
  for (const item of items) {
    if (item.allowBackorder) {
      continue;
    }

    const updated = await tx.productVariant.updateMany({
      where: {
        id: item.variantId,
        stock: { gte: item.quantity },
      },
      data: {
        stock: { decrement: item.quantity },
      },
    });

    if (updated.count === 0) {
      throw new Error("One or more items in your cart are out of stock.");
    }
  }
}

export async function restoreOrderStock(
  tx: Prisma.TransactionClient,
  items: Array<{ variantId: string; quantity: number; allowBackorder: boolean }>,
) {
  for (const item of items) {
    if (item.allowBackorder) {
      continue;
    }

    await tx.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: { increment: item.quantity },
      },
    });
  }
}

export async function cancelPendingOrder(orderId: string, reference: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            select: {
              allowBackorder: true,
            },
          },
        },
      },
    },
  });

  if (!order || order.status !== "PENDING_PAYMENT") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await restoreOrderStock(
      tx,
      order.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        allowBackorder: item.variant.allowBackorder,
      })),
    );

    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    await tx.paymentTransaction.updateMany({
      where: { reference },
      data: { status: "FAILED" },
    });
  });
}

export async function fulfillPaidOrder(reference: string, verified: VerifyTransactionData) {
  const existingPaymentTx = await prisma.paymentTransaction.findUnique({
    where: { reference },
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: {
                select: {
                  allowBackorder: true,
                },
              },
            },
          },
          user: true,
        },
      },
    },
  });

  if (!existingPaymentTx?.order) {
    return { ok: false as const, reason: "orphaned_payment" as const };
  }

  if (verified.amount !== existingPaymentTx.amountKobo) {
    await cancelPendingOrder(existingPaymentTx.orderId, reference);
    return { ok: false as const, reason: "amount_mismatch" as const };
  }

  const order = await prisma.$transaction(async (tx) => {
    const paymentTx = await tx.paymentTransaction.findUnique({
      where: { id: existingPaymentTx.id },
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: {
                  select: {
                    allowBackorder: true,
                  },
                },
              },
            },
            user: true,
          },
        },
      },
    });

    if (!paymentTx?.order) {
      throw new Error("Payment transaction not found");
    }

    if (paymentTx.status === "SUCCESS" || paymentTx.order.status === "PAID") {
      return paymentTx.order;
    }

    await tx.paymentTransaction.update({
      where: { id: paymentTx.id },
      data: {
        status: "SUCCESS",
        provider: "PAYSTACK",
        gatewayResponse: verified as unknown as Prisma.InputJsonValue,
        verifiedAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: paymentTx.order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        cart: {
          userId: paymentTx.order.userId,
        },
      },
    });

    for (const item of paymentTx.order.items) {
      await tx.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          orderId: paymentTx.order.id,
          type: "SALE",
          quantityDelta: -item.quantity,
          reason: `Order ${paymentTx.order.orderNumber} paid via Paystack`,
        },
      });
    }

    return paymentTx.order;
  });

  if (order.user.email) {
    try {
      await sendOrderConfirmationEmail({
        to: order.user.email,
        orderNumber: order.orderNumber,
      });
    } catch (error) {
      console.error("Order confirmation email failed", error);
    }
  }

  return { ok: true as const, order };
}
