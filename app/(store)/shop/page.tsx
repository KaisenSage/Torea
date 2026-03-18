import { ShopProductGrid } from "@/components/product/ShopProductGrid";
import { prisma } from "@/server/db/prisma";

type ShopVariant = {
  id: string;
  priceKobo: number;
  color: string | null;
  size: string | null;
  stock: number;
};

type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  material: string | null;
  keyFeatures: unknown;
  availableSizes: unknown;
  availableColors: unknown;
  stockTotal: number;
  createdAt: Date;
  variants: ShopVariant[];
  images: Array<{ cloudflareImageId: string }>;
};

type ShopPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: "latest" | "price-asc" | "price-desc";
  }>;
};

function normalizeCategoryValue(value: string | null | undefined) {
  return (value || "").toLowerCase().trim();
}

function normalizeText(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeQuery(query: string) {
  return normalizeText(query).split(" ").filter(Boolean);
}

function buildShopHref(category: string, sort: "latest" | "price-asc" | "price-desc", q?: string) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (sort !== "latest") {
    params.set("sort", sort);
  }

  if (q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const q = normalizeText(params.q || "");
  const selectedCategory = (params.category || "").toLowerCase().trim();
  const sort = params.sort || "latest";
  const queryTokens = tokenizeQuery(q);

  let products: ShopProduct[] = [];

  try {
    products = (await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        variants: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    })) as unknown as ShopProduct[];
  } catch {
    products = [];
  }

  const normalized = products.map((product) => {
    const prices = product.variants.map((variant: ShopVariant) => variant.priceKobo);
    const minPriceKobo = prices.length ? Math.min(...prices) : 0;
    const colorsFromMetadata = Array.isArray(product.availableColors)
        ? product.availableColors.map((color: unknown) => String(color).toLowerCase().trim()).filter(Boolean)
      : [];
    const sizesFromMetadata = Array.isArray(product.availableSizes)
        ? product.availableSizes.map((size: unknown) => String(size).toLowerCase().trim()).filter(Boolean)
      : [];
    const colors = Array.from(
      new Set([
          ...colorsFromMetadata,
          ...product.variants
            .map((variant: ShopVariant) => variant.color)
            .filter(Boolean)
            .map((color: string | null) => String(color).toLowerCase().trim()),
      ]),
    );
    const sizes = Array.from(
      new Set([
        ...sizesFromMetadata,
        ...product.variants
          .map((variant: ShopVariant) => variant.size)
          .filter(Boolean)
          .map((size: string | null) => String(size)),
      ]),
    );

    return {
      ...product,
      minPriceKobo,
      colors,
      sizes,
      keyFeatureList: Array.isArray(product.keyFeatures)
        ? product.keyFeatures.map((feature: unknown) => String(feature))
        : [],
      categoryLabel: normalizeCategoryValue(product.category),
      subcategoryLabel: normalizeCategoryValue(product.subcategory),
      searchHaystack: normalizeText(
        [
          product.name,
          product.description,
          product.category,
          product.subcategory,
          product.material,
          ...colors,
          ...sizes,
          ...(Array.isArray(product.keyFeatures) ? product.keyFeatures.map((feature: unknown) => String(feature)) : []),
        ].join(" "),
      ),
      totalStock: product.stockTotal || product.variants.reduce((sum: number, variant: ShopVariant) => sum + variant.stock, 0),
    };
  });

  const filtered = normalized.filter((product) => {
    const matchesQuery =
      queryTokens.length === 0 ||
      queryTokens.every((token) => product.searchHaystack.includes(token));
    const matchesCategory =
      !selectedCategory ||
      product.categoryLabel.includes(selectedCategory) ||
      product.subcategoryLabel.includes(selectedCategory);

    return matchesQuery && matchesCategory;
  });

  const pageTitle =
    selectedCategory === "tops"
      ? "Tops"
      : selectedCategory === "bottoms"
        ? "Bottoms"
        : selectedCategory === "two piece"
          ? "Two Piece"
          : selectedCategory === "jumpsuits"
            ? "Jumpsuits"
            : sort === "price-asc"
              ? "New Arrivals"
              : "All Products";
  const pageDescription =
    selectedCategory === "tops"
      ? "Browse our catalog"
      : selectedCategory === "bottoms"
        ? "Browse our catalog"
        : selectedCategory === "two piece"
          ? "Browse our catalog"
          : selectedCategory === "jumpsuits"
            ? "Browse our catalog"
            : sort === "price-asc"
              ? "Browse our catalog"
              : "Browse our catalog";
  const activeChip = selectedCategory || (sort === "price-asc" ? "new-arrivals" : "all");

  const sorted = [...filtered].sort((a, b) => {
    if (queryTokens.length > 0) {
      const score = (product: (typeof normalized)[number]) => {
        let value = 0;

        for (const token of queryTokens) {
          if (normalizeText(product.name).includes(token)) {
            value += 4;
          }
          if (normalizeText(product.category).includes(token) || normalizeText(product.subcategory).includes(token)) {
            value += 3;
          }
          if (normalizeText(product.description).includes(token)) {
            value += 2;
          }
          if (product.searchHaystack.includes(token)) {
            value += 1;
          }
        }

        return value;
      };

      const scoreDiff = score(b) - score(a);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
    }

    if (sort === "price-asc") {
      return a.minPriceKobo - b.minPriceKobo;
    }
    if (sort === "price-desc") {
      return b.minPriceKobo - a.minPriceKobo;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-zinc-600">{pageDescription}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All", href: buildShopHref("", "latest", params.q || "") },
          { key: "new-arrivals", label: "New Arrivals", href: buildShopHref("", "price-asc", params.q || "") },
          { key: "tops", label: "Tops", href: buildShopHref("tops", sort, params.q || "") },
          { key: "bottoms", label: "Bottoms", href: buildShopHref("bottoms", sort, params.q || "") },
          { key: "two-piece", label: "Two Piece", href: buildShopHref("two piece", sort, params.q || "") },
          { key: "jumpsuits", label: "Jumpsuits", href: buildShopHref("jumpsuits", sort, params.q || "") },
        ].map((chip) => (
          <a
            key={chip.key}
            href={chip.href}
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeChip === chip.key
                ? "bg-black text-white"
                : "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
            }`}
          >
            {chip.label}
          </a>
        ))}
      </div>

      <form className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]">
        <input
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search by product name, type, color, or fabric"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />

        <select name="category" defaultValue={params.category || ""} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm">
          <option value="">All sections</option>
          <option value="tops">Tops</option>
          <option value="bottoms">Bottoms</option>
          <option value="two piece">Two Piece</option>
          <option value="jumpsuits">Jumpsuits</option>
        </select>

        <select name="sort" defaultValue={sort} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm">
          <option value="latest">Latest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>

        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
            Search
          </button>
          <a href="/shop" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700">
            Reset
          </a>
        </div>
      </form>

      <ShopProductGrid
        items={sorted.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          minPriceKobo: item.minPriceKobo,
          totalStock: item.totalStock,
          colors: item.colors,
          imageUrl: (() => {
            if (
              item.slug === "mens-streetwear-track-pants" ||
              item.slug === "men’s-streetwear-track-pants"
            ) {
              // Always show burgundy as default image
              return "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_9980.JPG";
            }
            const rawId = item.images[0]?.cloudflareImageId;
            const fallback = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop";

            if (!rawId) {
              return fallback;
            }

            // If rawId is already a full URL, use it directly
            if (rawId.startsWith("http://") || rawId.startsWith("https://")) {
              return rawId;
            }

            // Otherwise, treat as Cloudflare image ID
            return `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH || "1Zd_w7gOgRwMrhdmCCSGag"}/${rawId}/public`;
          })(),
          cartKey: item.variants[0]?.id ? `variant:${item.variants[0].id}` : `fallback:${item.slug}`,
        }))}
      />

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-600">
          No products match your filters yet.
        </div>
      ) : null}
    </div>
  );
}
