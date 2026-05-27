"use server";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { getCurrentDbUser } from "@/server/auth/rbac";
import { getCartCookieMap } from "@/server/services/cart-cookie";
import { mergeCartCookieIntoDatabase } from "@/server/services/cart-merge";
import { initializePaystackTransaction } from "@/server/services/paystack";

type CheckoutInput = {
  contactEmailOrPhone: string;
  appBaseUrl?: string;
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

type ResolvedCheckoutItem = {
  variantId: string;
  productId: string;
  quantity: number;
  unitPriceKobo: number;
  totalPriceKobo: number;
  variant: {
    id: string;
    productId: string;
    priceKobo: number;
    stock: number;
    allowBackorder: boolean;
    size: string | null;
    color: string | null;
  };
};

function generateOrderNumber() {
  return `TOREA-${Date.now()}`;
}

function normalizeValue(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function normalizeGuestEmailOrPhone(value: string) {
  const raw = value.trim();

  if (raw.includes("@")) {
    return raw.toLowerCase();
  }

  const sanitized = raw.replace(/\D/g, "");
  return `${sanitized || "guest"}@guest.torea.store`;
}

function parseFallbackKey(key: string) {
  const withoutPrefix = key.replace(/^fallback:/, "");
  const [slug, ...parts] = withoutPrefix.split("::");
  const sizePart = parts.find((part) => part.startsWith("size="));
  const colorPart = parts.find((part) => part.startsWith("color="));

  return {
    slug,
    size: sizePart ? decodeURIComponent(sizePart.replace("size=", "")) : "",
    color: colorPart ? decodeURIComponent(colorPart.replace("color=", "")) : "",
  };
}

function resolveAppBaseUrl(inputBaseUrl?: string) {
  const candidate = inputBaseUrl || process.env.NEXT_PUBLIC_APP_URL;

  if (!candidate) {
    throw new Error("App URL is not configured for Paystack callback");
  }

  try {
    return new URL(candidate).origin;
  } catch {
    throw new Error("App URL is invalid for Paystack callback");
  }
}

async function getOrCreateGuestUser(input: CheckoutInput) {
  const email = normalizeGuestEmailOrPhone(input.contactEmailOrPhone);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return existingUser;
  }

  const [firstName, ...lastNameParts] = input.shipping.fullName.trim().split(/\s+/);
  const guestUserData: Prisma.UserUncheckedCreateInput = {
    clerkId: undefined as unknown as string,
    email,
    firstName: firstName || null,
    lastName: lastNameParts.join(" ") || null,
    role: "CUSTOMER",
  };

  return prisma.user.create({
    data: guestUserData,
  });
}

async function resolveSignedInCartItems(userId: string): Promise<ResolvedCheckoutItem[]> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
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

  return cart.items.map((item) => {
    if (!item.variant) {
      throw new Error("A cart item is missing its product variant.");
    }

    return {
      variantId: item.variantId,
      productId: item.variant.productId,
      quantity: item.quantity,
      unitPriceKobo: item.variant.priceKobo,
      totalPriceKobo: item.variant.priceKobo * item.quantity,
      variant: {
        id: item.variant.id,
        productId: item.variant.productId,
        priceKobo: item.variant.priceKobo,
        stock: item.variant.stock,
        allowBackorder: item.variant.allowBackorder,
        size: item.variant.size,
        color: item.variant.color,
      },
    };
  });
}

async function resolveGuestCartItems(): Promise<ResolvedCheckoutItem[]> {
  const map = await getCartCookieMap();
  const entries = Object.entries(map).filter(([key, quantity]) => quantity > 0 && !key.endsWith(":imageUrl"));

  if (entries.length === 0) {
    throw new Error("Cart is empty");
  }

  const variantIds = entries
    .map(([key]) => (key.startsWith("variant:") ? key.replace("variant:", "") : null))
    .filter((value): value is string => Boolean(value));
  const fallbackRequests = entries
    .filter(([key]) => key.startsWith("fallback:"))
    .map(([key, quantity]) => ({
      key,
      quantity,
      ...parseFallbackKey(key),
    }));

  const directVariants = variantIds.length
    ? await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
      })
    : [];
  const fallbackProducts = fallbackRequests.length
    ? await prisma.product.findMany({
        where: {
          slug: {
            in: Array.from(new Set(fallbackRequests.map((item) => item.slug))),
          },
        },
        include: {
          variants: true,
        },
      })
    : [];

  const directVariantMap = new Map(directVariants.map((variant) => [variant.id, variant]));
  const fallbackProductMap = new Map(fallbackProducts.map((product) => [product.slug, product]));

  return entries.map(([key, quantity]) => {
    if (key.startsWith("variant:")) {
      const variantId = key.replace("variant:", "");
      const variant = directVariantMap.get(variantId);

      if (!variant) {
        throw new Error("One of the items in your cart is no longer available.");
      }

      return {
        variantId: variant.id,
        productId: variant.productId,
        quantity,
        unitPriceKobo: variant.priceKobo,
        totalPriceKobo: variant.priceKobo * quantity,
        variant: {
          id: variant.id,
          productId: variant.productId,
          priceKobo: variant.priceKobo,
          stock: variant.stock,
          allowBackorder: variant.allowBackorder,
          size: variant.size,
          color: variant.color,
        },
      };
    }

    const request = parseFallbackKey(key);
    const product = fallbackProductMap.get(request.slug);

    if (!product) {
      throw new Error("One of the items in your cart is no longer available.");
    }

    const exactVariant = product.variants.find(
      (variant) =>
        normalizeValue(variant.size) === normalizeValue(request.size) &&
        normalizeValue(variant.color) === normalizeValue(request.color),
    );
    const looseVariant = product.variants.length === 1 ? product.variants[0] : null;
    const variant = exactVariant || looseVariant;

    if (!variant) {
      throw new Error(`We couldn't match ${product.name} to a purchasable variant. Please re-add it to your cart.`);
    }

    return {
      variantId: variant.id,
      productId: variant.productId,
      quantity,
      unitPriceKobo: variant.priceKobo,
      totalPriceKobo: variant.priceKobo * quantity,
      variant: {
        id: variant.id,
        productId: variant.productId,
        priceKobo: variant.priceKobo,
        stock: variant.stock,
        allowBackorder: variant.allowBackorder,
        size: variant.size,
        color: variant.color,
      },
    };
  });
}

function assertStockAvailability(items: ResolvedCheckoutItem[]) {
  for (const item of items) {
    if (!item.variant.allowBackorder && item.variant.stock < item.quantity) {
      throw new Error(
        `Sorry, "${item.variant.color || "Unknown"} ${item.variant.size || ""}" is out of stock or not enough stock for your order.`,
      );
    }
  }
}


export async function createCheckoutSession(input: CheckoutInput) {
  const signedInUser = await getCurrentDbUser();
  const user = signedInUser ?? (await getOrCreateGuestUser(input));
  let items: ResolvedCheckoutItem[];

  if (signedInUser) {
    await mergeCartCookieIntoDatabase(user.id);

    try {
      items = await resolveSignedInCartItems(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";

      if (!message.includes("cart is empty")) {
        throw error;
      }

      items = await resolveGuestCartItems();
    }
  } else {
    items = await resolveGuestCartItems();
  }

  assertStockAvailability(items);

  const subtotalKobo = items.reduce((acc, item) => acc + item.totalPriceKobo, 0);

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
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPriceKobo: item.unitPriceKobo,
            totalPriceKobo: item.totalPriceKobo,
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

  const appBaseUrl = resolveAppBaseUrl(input.appBaseUrl);
  const callbackUrl = `${appBaseUrl}/orders/thank-you?reference=${reference}`;

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
