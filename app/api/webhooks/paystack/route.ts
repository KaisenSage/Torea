import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { sendOrderConfirmationEmail } from "@/server/services/email";
import { verifyPaystackTransaction } from "@/server/services/paystack";

type PaystackWebhookPayload = {
  event: string;
  data: {
    reference: string;
    amount: number;
    customer?: {
      email?: string;
    };
  };
};

function isValidPaystackSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return false;
  }

  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!isValidPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as PaystackWebhookPayload;

  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const reference = payload.data.reference;

  try {
    await prisma.webhookEvent.create({
      data: {
        provider: "PAYSTACK",
        eventId: reference,
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });
  } catch {
    return NextResponse.json({ duplicate: true }, { status: 200 });
  }

  const verified = await verifyPaystackTransaction(reference);

  if (verified.status !== "success") {
    await prisma.paymentTransaction.updateMany({
      where: { reference },
      data: {
        status: "FAILED",
        gatewayResponse: verified as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ verified: false }, { status: 200 });
  }

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const paymentTx = await tx.paymentTransaction.findUnique({
      where: { reference },
      include: {
        order: {
          include: {
            items: true,
            user: true,
          },
        },
      },
    });

    if (!paymentTx) {
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

    for (const item of paymentTx.order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

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
    await sendOrderConfirmationEmail({
      to: order.user.email,
      orderNumber: order.orderNumber,
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
