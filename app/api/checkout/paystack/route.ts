import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/server/actions/checkout";

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

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as CheckoutPayload;
    const appBaseUrl = new URL(req.url).origin;
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
        contactEmailOrPhone: payload.contact.emailOrPhone,
        appBaseUrl,
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create order before payment.";
      const normalized = message.toLowerCase();

      console.error("Checkout session creation failed", error);

      if (normalized.includes("unauthorized")) {
        return NextResponse.json(
          { error: "Please sign in before checkout. Guest checkout is temporarily disabled to prevent missing orders." },
          { status: 401 },
        );
      }

      if (normalized.includes("cart is empty") || normalized.includes("out of stock") || normalized.includes("not enough stock")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }

      if (
        normalized.includes("can't reach database server") ||
        normalized.includes("reach database server") ||
        normalized.includes("p1001")
      ) {
        return NextResponse.json(
          { error: "Database is temporarily unavailable. No order was created. Please try again in a moment." },
          { status: 503 },
        );
      }

      if (
        normalized.includes("temporarily unreachable") ||
        normalized.includes("dns resolution failed")
      ) {
        return NextResponse.json(
          { error: "Paystack is temporarily unavailable from this server. No charge was started. Please try again shortly." },
          { status: 503 },
        );
      }

      if (
        normalized.includes("paystack") ||
        normalized.includes("app url") ||
        normalized.includes("callback") ||
        normalized.includes("configured") ||
        normalized.includes("invalid")
      ) {
        return NextResponse.json({ error: message }, { status: 500 });
      }


      return NextResponse.json({ error: message || "Unable to create your order before payment. No charge was started. Please try again." }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid checkout request payload." }, { status: 400 });
  }
}
