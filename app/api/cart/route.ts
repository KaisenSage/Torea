import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/prisma";
import { getCartCookieMap, setCartCookieMap } from "@/server/services/cart-cookie";

type CartLineItem = {
  key: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  priceKobo: number;
  imageUrl: string;
  product: any;
};

type CartResponse = {
  items: CartLineItem[];
};

function fallbackNameFromKey(key: string) {
  const slug = key.replace(/^fallback:/, "").split("::")[0] || "product";
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseFallbackMeta(key: string) {
  const [, rawMeta] = key.split("fallback:");
  const parts = (rawMeta || "").split("::");
  const sizePart = parts.find((part) => part.startsWith("size="));
  const colorPart = parts.find((part) => part.startsWith("color="));

  const size = sizePart ? decodeURIComponent(sizePart.replace("size=", "")) : "M";
  const color = colorPart ? decodeURIComponent(colorPart.replace("color=", "")) : "Default";

  return { size, color };
}

function fallbackSlugFromKey(key: string) {
  return key.replace(/^fallback:/, "").split("::")[0] || "";
}

function fallbackImageForKey(key: string) {
  if (key.includes("dream-club")) {
    return "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=300&auto=format&fit=crop";
  }

  return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop";
}

async function fromCookieMap(map: Record<string, number>): Promise<CartResponse> {
  const entries = Object.entries(map);
  const variantIds = entries
    .map(([key]) => (key.startsWith("variant:") ? key.replace("variant:", "") : ""))
    .filter(Boolean);
  const fallbackSlugs = entries
    .map(([key]) => (key.startsWith("fallback:") ? fallbackSlugFromKey(key) : ""))
    .filter(Boolean);

  let variantLookup = new Map<string, CartLineItem>();
  let fallbackLookup = new Map<string, { name: string; priceKobo: number; imageUrl: string; product: any }>();

  if (variantIds.length > 0) {
    try {
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      });

      variantLookup = new Map(
        variants.map((variant) => [
          variant.id,
          {
            key: `variant:${variant.id}`,
            name: variant.product.name,
            size: variant.size || "One size",
            color: variant.color || "Default",
            quantity: 0,
            priceKobo: variant.priceKobo,
            imageUrl: (() => {
              const images = variant.product.images || [];
              const normalize = (str: string) => (str || "").toLowerCase().replace(/\s+/g, "");
              const matched = images.find((img) => normalize(img.color ?? "") === normalize(variant.color ?? ""));
              if (matched?.cloudflareImageId) {
                return `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH || process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${matched.cloudflareImageId}/public`;
              }
              const fallback = images.find((img) => img.cloudflareImageId);
              if (fallback) {
                return `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH || process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${fallback.cloudflareImageId}/public`;
              }
              return fallbackImageForKey(variant.product.slug);
            })(),
            product: {
              ...variant.product,
              images: variant.product.images,
            },
          },
        ]),
      );
    } catch {
      variantLookup = new Map();
    }
  }

  if (fallbackSlugs.length > 0) {
    try {
      const products = await prisma.product.findMany({
        where: {
          slug: {
            in: Array.from(new Set(fallbackSlugs)),
          },
          isActive: true,
        },
        include: {
          variants: {
            orderBy: { createdAt: "asc" },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      fallbackLookup = new Map(
        products.map((product) => {
          const lowestPriceKobo = product.variants.length
            ? Math.min(...product.variants.map((variant) => variant.priceKobo))
            : 4000000;

          const imageUrl =
            product.images[0]?.cloudflareImageId && process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH
              ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${product.images[0].cloudflareImageId}/public`
              : fallbackImageForKey(product.slug);

          return [
            product.slug,
            {
              name: product.name,
              priceKobo: lowestPriceKobo,
              imageUrl,
              product: {
                ...product,
                images: product.images,
              },
            },
          ];
        }),
      );
    } catch {
      fallbackLookup = new Map();
    }
  }

  const items: CartLineItem[] = entries.map(([key, quantity]) => {
    if (key.startsWith("variant:")) {
      const variantId = key.replace("variant:", "");
      const variantItem = variantLookup.get(variantId);
      if (variantItem) {
        return {
          ...variantItem,
          quantity,
        };
      }
    }

    const fallbackSlug = fallbackSlugFromKey(key);
    const fallbackItem = fallbackLookup.get(fallbackSlug);
    const fallbackMeta = parseFallbackMeta(key);
    // Check for custom imageUrl
    const customImageUrl = map[`${key}:imageUrl`];
    return {
      key,
      name: fallbackItem?.name || `TORÉA ${fallbackNameFromKey(key)}`,
      size: fallbackMeta.size,
      color: fallbackMeta.color,
      quantity,
      priceKobo: fallbackItem?.priceKobo || 4000000,
      imageUrl: fallbackItem?.imageUrl || fallbackImageForKey(key),
      product: fallbackItem?.product || null,
    };
  });

  return { items };
}

async function fromDatabase(clerkId: string): Promise<CartResponse | null> {
  const dbUser = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });

  if (!dbUser) {
    return null;
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: dbUser.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return { items: [] };
  }

  const items: CartLineItem[] = cart.items.map((item) => {
    const images = item.variant.product.images || [];
    const normalize = (str: string) => (str || "").toLowerCase().replace(/\s+/g, "");
    const matched = images.find((img) => normalize(img.color ?? "") === normalize(item.variant.color ?? ""));
    let imageUrl = "";
    if (matched?.cloudflareImageId) {
      imageUrl = `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH || process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${matched.cloudflareImageId}/public`;
    } else {
      const fallback = images.find((img) => img.cloudflareImageId);
      if (fallback) {
        imageUrl = `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH || process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${fallback.cloudflareImageId}/public`;
      } else {
        imageUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop";
      }
    }
    return {
      key: `variant:${item.variantId}`,
      name: item.variant.product.name,
      size: item.variant.size || "One size",
      color: item.variant.color || "Default",
      quantity: item.quantity,
      priceKobo: item.variant.priceKobo,
      imageUrl,
      product: {
        ...item.variant.product,
        images: item.variant.product.images,
      },
    };
  });

  return { items };
}

export async function GET() {
  const { userId } = await auth();

  if (userId) {
    try {
      const dbCart = await fromDatabase(userId);
      if (dbCart) {
        return NextResponse.json(dbCart, { status: 200 });
      }
    } catch {
      // fall through to cookie mode
    }
  }

  const cookieMap = await getCartCookieMap();
  return NextResponse.json(await fromCookieMap(cookieMap), { status: 200 });
}

export async function PATCH(req: Request) {
  const payload = (await req.json()) as { key: string; action: "increment" | "decrement" | "remove"; imageUrl?: string };
  const { userId } = await auth();

  if (!payload?.key || !payload?.action) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (userId && payload.key.startsWith("variant:")) {
    try {
      const variantId = payload.key.replace("variant:", "");
      const dbUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });

      if (dbUser) {
        const cart = await prisma.cart.upsert({
          where: { userId: dbUser.id },
          update: {},
          create: { userId: dbUser.id },
        });

        if (payload.action === "increment") {
          await prisma.cartItem.upsert({
            where: { cartId_variantId: { cartId: cart.id, variantId } },
            update: { quantity: { increment: 1 }, imageUrl: payload.imageUrl || undefined },
            create: { cartId: cart.id, variantId, quantity: 1, imageUrl: payload.imageUrl || undefined },
          });
        }

        if (payload.action === "decrement") {
          const existing = await prisma.cartItem.findUnique({
            where: { cartId_variantId: { cartId: cart.id, variantId } },
          });

          if (existing) {
            if (existing.quantity <= 1) {
              await prisma.cartItem.delete({ where: { id: existing.id } });
            } else {
              await prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: { decrement: 1 } },
              });
            }
          }
        }

        if (payload.action === "remove") {
          await prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });
        }

        const dbCart = await fromDatabase(userId);
        return NextResponse.json(dbCart || { items: [] }, { status: 200 });
      }
    } catch {
      // fall back to cookie mode
    }
  }

  const map = await getCartCookieMap();

  if (payload.action === "increment") {
    map[payload.key] = (map[payload.key] || 0) + 1;
  }

  if (payload.action === "decrement") {
    const current = map[payload.key] || 0;
    if (current <= 1) {
      delete map[payload.key];
    } else {
      map[payload.key] = current - 1;
    }
  }

  if (payload.action === "remove") {
    delete map[payload.key];
  }

  await setCartCookieMap(map);
  return NextResponse.json(await fromCookieMap(map), { status: 200 });
}

export async function DELETE() {
  const { userId } = await auth();

  if (userId) {
    try {
      const dbUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
      if (dbUser) {
        const cart = await prisma.cart.findUnique({ where: { userId: dbUser.id }, select: { id: true } });
        if (cart) {
          await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      }
    } catch {
      // Ignore DB clear errors and still clear cookie fallback cart.
    }
  }

  await setCartCookieMap({});
  return NextResponse.json({ items: [] }, { status: 200 });
}
