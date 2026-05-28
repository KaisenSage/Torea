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
    const deliveryType = payload.deliveryType || "ship";
    const appBaseUrl = new URL(req.url).origin;

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

      if (normalized.includes("unauthorized")) {
        return NextResponse.json(
          { error: "Please sign in before checkout. Guest checkout is temporarily disabled to prevent missing orders." },
          { status: 401 },
        );
      }

      if (
        normalized.includes("cart is empty") ||
        normalized.includes("out of stock") ||
        normalized.includes("not enough stock") ||
        normalized.includes("no longer available") ||
        normalized.includes("couldn't match")
      ) {
        return NextResponse.json({ error: message }, { status: 400 });
      }

      if (
        normalized.includes("paystack initialize failed") ||
        normalized.includes("paystack is temporarily unreachable") ||
        normalized.includes("paystack_secret_key") ||
        normalized.includes("app url is not configured") ||
        normalized.includes("app url is invalid")
      ) {
        return NextResponse.json({ error: message }, { status: 500 });
      }

      console.error("Checkout session creation failed", error);

      return NextResponse.json(
        { error: "Unable to create your order before payment. No charge was started. Please try again." },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid checkout request payload." }, { status: 400 });
  }
}
