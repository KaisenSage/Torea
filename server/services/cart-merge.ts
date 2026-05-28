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

type MergeableCartItem = {
  variantId: string;
  quantity: number;
};

async function resolveCookieCartItems(): Promise<MergeableCartItem[]> {
  const map = await getCartCookieMap();
  const entries = Object.entries(map).filter(([key, quantity]) => quantity > 0 && !key.endsWith(":imageUrl"));

  if (entries.length === 0) {
    return [];
  }

  const variantIds = entries
    .map(([key]) => (key.startsWith("variant:") ? key.replace("variant:", "") : null))
    .filter((value): value is string => Boolean(value));
  const fallbackRequests = entries
    .filter(([key]) => key.startsWith("fallback:"))
    .map(([key, quantity]) => ({
      quantity,
      ...parseFallbackKey(key),
    }));

  const directVariants = variantIds.length
    ? await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: {
          id: true,
        },
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

  const directVariantIds = new Set(directVariants.map((variant) => variant.id));
  const fallbackProductMap = new Map(fallbackProducts.map((product) => [product.slug, product]));
  const resolvedItems: MergeableCartItem[] = [];

  for (const [key, quantity] of entries) {
    if (key.startsWith("variant:")) {
      const variantId = key.replace("variant:", "");

      if (directVariantIds.has(variantId)) {
        resolvedItems.push({ variantId, quantity });
      }

      continue;
    }

    const request = parseFallbackKey(key);
    const product = fallbackProductMap.get(request.slug);

    if (!product) {
      continue;
    }

    const exactVariant = product.variants.find(
      (variant) =>
        normalizeValue(variant.size) === normalizeValue(request.size) &&
        normalizeValue(variant.color) === normalizeValue(request.color),
    );
    const looseVariant = product.variants.length === 1 ? product.variants[0] : null;
    const variant = exactVariant || looseVariant;

    if (!variant) {
      continue;
    }

    resolvedItems.push({
      variantId: variant.id,
      quantity,
    });
  }

  return resolvedItems;
}

export async function mergeCartCookieIntoDatabase(userId: string) {
  const cookieItems = await resolveCookieCartItems();

  if (cookieItems.length === 0) {
    return false;
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });

  for (const item of cookieItems) {
    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: item.variantId,
        },
      },
      update: {
        quantity: {
          increment: item.quantity,
        },
      },
      create: {
        cartId: cart.id,
        variantId: item.variantId,
        quantity: item.quantity,
      },
    });
  }

  await setCartCookieMap({});
  return true;
}