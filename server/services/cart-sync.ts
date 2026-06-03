import { prisma } from "@/server/db/prisma";
import { getCartCookieMap, setCartCookieMap } from "@/server/services/cart-cookie";

function normalizeValue(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
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

async function resolveFallbackKeyToVariantId(key: string) {
  const request = parseFallbackKey(key);
  const product = await prisma.product.findUnique({
    where: { slug: request.slug },
    include: { variants: true },
  });

  if (!product) {
    return null;
  }

  const exactVariant = product.variants.find(
    (variant) =>
      normalizeValue(variant.size) === normalizeValue(request.size) &&
      normalizeValue(variant.color) === normalizeValue(request.color),
  );
  const looseVariant = product.variants.length === 1 ? product.variants[0] : null;

  return (exactVariant || looseVariant)?.id ?? null;
}

export async function syncCookieCartToDatabase(clerkId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!dbUser) {
    return false;
  }

  const cookieMap = await getCartCookieMap();
  const entries = Object.entries(cookieMap).filter(
    ([key, quantity]) => quantity > 0 && !key.endsWith(":imageUrl"),
  );

  if (entries.length === 0) {
    return false;
  }

  const cart = await prisma.cart.upsert({
    where: { userId: dbUser.id },
    update: {},
    create: { userId: dbUser.id },
  });

  for (const [key, quantity] of entries) {
    let variantId: string | null = null;

    if (key.startsWith("variant:")) {
      variantId = key.replace("variant:", "");
    } else if (key.startsWith("fallback:")) {
      variantId = await resolveFallbackKeyToVariantId(key);
    }

    if (!variantId) {
      continue;
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }
  }

  await setCartCookieMap({});
  return true;
}

export async function resolveCartKeyToVariantId(key: string) {
  if (key.startsWith("variant:")) {
    return key.replace("variant:", "");
  }

  if (key.startsWith("fallback:")) {
    return resolveFallbackKeyToVariantId(key);
  }

  return null;
}
