import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { verifyPaystackTransaction } from "@/server/services/paystack";
import {
  cancelPendingOrder,
  fulfillPaidOrder,
} from "@/server/services/order-fulfillment";

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

  let verified;

  try {
    verified = await verifyPaystackTransaction(reference);
  } catch (error) {
    console.error("Paystack verify failed in webhook", error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }

  if (verified.status !== "success") {
    const paymentTx = await prisma.paymentTransaction.findUnique({
      where: { reference },
      select: { orderId: true },
    });

    if (paymentTx) {
      await cancelPendingOrder(paymentTx.orderId, reference);
    } else {
      await prisma.paymentTransaction.updateMany({
        where: { reference },
        data: {
          status: "FAILED",
          gatewayResponse: verified as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json({ verified: false }, { status: 200 });
  }

  const result = await fulfillPaidOrder(reference, verified);

  if (!result.ok) {
    return NextResponse.json({ verified: false, reason: result.reason }, { status: 200 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
