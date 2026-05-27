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

type VariantInventory = {
  stock: number;
  allowBackorder: boolean;
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

  const variantIds = Array.from(new Set(cookieItems.map((item) => item.variantId)));
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: {
      id: true,
      stock: true,
      allowBackorder: true,
    },
  });
  const variantInventoryMap = new Map<string, VariantInventory>(
    variants.map((variant) => [variant.id, { stock: variant.stock, allowBackorder: variant.allowBackorder }]),
  );

  for (const item of cookieItems) {
    const inventory = variantInventoryMap.get(item.variantId);

    if (!inventory) {
      continue;
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: item.variantId,
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    const desiredQuantity = (existing?.quantity || 0) + item.quantity;
    const finalQuantity = inventory.allowBackorder ? desiredQuantity : Math.min(desiredQuantity, inventory.stock);

    if (finalQuantity <= 0) {
      if (existing) {
        await prisma.cartItem.delete({ where: { id: existing.id } });
      }
      continue;
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: finalQuantity },
      });
      continue;
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: item.variantId,
        quantity: finalQuantity,
      },
    });
  }

  await setCartCookieMap({});
  return true;
}