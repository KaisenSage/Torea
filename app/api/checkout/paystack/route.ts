import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/server/actions/checkout";
import { initializePaystackTransaction } from "@/server/services/paystack";

type CheckoutPayload = {
  deliveryType?: "ship" | "pickup";
  contact: {
    emailOrPhone: string;
  };
  shipping: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    phone: string;
  };
  totals: {
    totalKobo: number;
  };
};

function normalizeEmailOrPhone(value: string) {
  const raw = value.trim();

  if (raw.includes("@")) {
    return raw.toLowerCase();
  }

  // Paystack initialize requires an email; use a deterministic placeholder for phone-only checkout.
  const sanitized = raw.replace(/\D/g, "");
  return `${sanitized || "guest"}@guest.torea.store`;
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as CheckoutPayload;
    const deliveryType = payload.deliveryType || "ship";

    const fullName = `${payload.shipping.firstName || "Pickup"} ${payload.shipping.lastName || "Customer"}`.trim();
    const safeLine1 = payload.shipping.line1 || "TORÉA Studio Pickup";
    const safeCity = payload.shipping.city || "Lagos";
    const safeState = payload.shipping.state || "Lagos";

    if (
      !payload.contact.emailOrPhone ||
      !fullName ||
      (deliveryType === "ship" && (!payload.shipping.line1 || !payload.shipping.city))
    ) {
      return NextResponse.json({ error: "Missing required checkout fields" }, { status: 400 });
    }

    try {
      const session = await createCheckoutSession({
        shipping: {
          fullName,
          phone: payload.shipping.phone || payload.contact.emailOrPhone,
          line1: safeLine1,
          line2: payload.shipping.line2,
          city: safeCity,
          state: safeState,
        },
      });

      return NextResponse.json({ authorizationUrl: session.authorizationUrl }, { status: 200 });
    } catch {
      // Fallback path allows payment testing when DB/cart is not fully wired yet.
      const requestedTotalKobo = payload.totals?.totalKobo || 0;
      if (requestedTotalKobo <= 0) {
        return NextResponse.json({ error: "Cart is empty. Please add at least one item before checkout." }, { status: 400 });
      }
      const amountKobo = Math.max(requestedTotalKobo, 5000);
      const reference = `psk_fallback_${randomUUID()}`;

      try {
        const initialized = await initializePaystackTransaction({
          email: normalizeEmailOrPhone(payload.contact.emailOrPhone),
          amountKobo,
          reference,
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/thank-you?reference=${reference}`,
          metadata: {
            source: "checkout-fallback",
          },
        });

        return NextResponse.json({ authorizationUrl: initialized.authorization_url }, { status: 200 });
      } catch (error) {
        const details = error instanceof Error ? error.message : "Unknown Paystack error";
        return NextResponse.json(
          {
            error: `Paystack initialization failed. ${details}`,
          },
          { status: 502 },
        );
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid checkout request payload." }, { status: 400 });
  }
}
