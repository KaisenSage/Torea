import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { ProductVariantPurchase } from "@/components/product/ProductVariantPurchase";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

type ProductPageVariant = {
  id: string;
  priceKobo: number;
  size: string | null;
  color: string | null;
  stock: number;
};

type ProductRecord = {
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  material: string | null;
  careInstructions: string | null;
  keyFeatures: unknown;
  availableSizes: unknown;
  availableColors: unknown;
  stockTotal: number;
  variants: ProductPageVariant[];
  images: Array<{ cloudflareImageId: string }>;
  isActive: boolean;
};

const hiddenFeatureTokens = new Set([
  "perfect for gym",
  "yoga",
  "running",
  "and training",
  "and training.",
]);

function shouldHideFeature(value: string) {
  const normalized = value.toLowerCase().trim();
  return hiddenFeatureTokens.has(normalized);
}

const fallbackProducts = new Map([
  [
    "dream-club-black",
    {
      name: "TORÉA Island Dream Club T-shirt in black",
      description: "Cotton jersey tee with minimal branding and premium finish.",
      priceKobo: 4000000,
      imageUrl: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=1200&auto=format&fit=crop",
      sizes: ["S", "M", "L"],
      colors: ["Black"],
    },
  ],
  [
    "earth-fingerprint-ecru",
    {
      name: "TORÉA Earth Fingerprint T-shirt in ecru",
      description: "Soft-touch ecru base with fingerprint editorial artwork.",
      priceKobo: 4000000,
      imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
      sizes: ["S", "M", "L"],
      colors: ["Ecru"],
    },
  ],
  [
    "dream-club-ecru",
    {
      name: "TORÉA Dream Club T-shirt in soft ecru",
      description: "Relaxed fit tee for everyday elevated styling.",
      priceKobo: 4000000,
      imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1200&auto=format&fit=crop",
      sizes: ["S", "M", "L"],
      colors: ["Soft Ecru"],
    },
  ],
  [
    "atlas-washed-grey",
    {
      name: "TORÉA Atlas T-shirt in washed grey",
      description: "Washed grey texture with durable premium cotton.",
      priceKobo: 4500000,
      imageUrl: "https://images.unsplash.com/photo-1464863979621-258859e62245?q=80&w=1200&auto=format&fit=crop",
      sizes: ["S", "M", "L"],
      colors: ["Washed Grey"],
    },
  ],
  [
    "destiny-print-black",
    {
      name: "TORÉA Destiny print T-shirt in black",
      description: "Statement print piece designed for DETTY DECEMBER looks.",
      priceKobo: 4000000,
      imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=1200&auto=format&fit=crop",
      sizes: ["S", "M", "L"],
      colors: ["Black"],
    },
  ],
]);

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product: ProductRecord | null = null;

  try {
    product = (await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: {
          orderBy: { createdAt: "asc" },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    })) as unknown as ProductRecord | null;
  } catch {
    product = null;
  }

  const fallback = fallbackProducts.get(slug);
  if ((!product || !product.isActive) && !fallback) {
    notFound();
  }

  const minPrice = product
    ? product.variants.length
      ? Math.min(...product.variants.map((variant: ProductPageVariant) => variant.priceKobo))
      : 0
    : fallback?.priceKobo || 0;

  const heroImage =
    product?.images[0]?.cloudflareImageId && process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH
      ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${product.images[0].cloudflareImageId}/public`
      : fallback?.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop";
  const imageAlt = product?.name || fallback?.name || "TORÉA product";

  const sizes = product
    ? Array.from(
        new Set([
          ...(Array.isArray(product.availableSizes) ? product.availableSizes.map((size: unknown) => String(size)) : []),
          ...product.variants.map((variant: ProductPageVariant) => variant.size).filter(Boolean).map((size: string | null) => String(size)),
        ]),
      )
    : fallback?.sizes || [];
  const colors = product
    ? Array.from(
        new Set([
          ...(Array.isArray(product.availableColors) ? product.availableColors.map((color: unknown) => String(color)) : []),
          ...product.variants.map((variant: ProductPageVariant) => variant.color).filter(Boolean).map((color: string | null) => String(color)),
        ]),
      )
    : fallback?.colors || [];
  const keyFeatures = Array.isArray(product?.keyFeatures)
    ? product.keyFeatures
        .map((feature: unknown) => String(feature).trim())
        .filter((feature: string) => feature.length > 0)
        .filter((feature: string) => !shouldHideFeature(feature))
    : [];
  const totalStock = product?.stockTotal ?? 0;
  const category = product?.category?.trim() || "";
  const subcategory = product?.subcategory?.trim() || "";
  const showSubcategory =
    Boolean(subcategory) && category.toLowerCase() !== subcategory.toLowerCase();

  return (
    <div className="grid gap-8 pb-16 md:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100">
        <Image src={heroImage} alt={imageAlt} fill className="object-cover" />
      </div>
      <div className="space-y-5">
        <h1 className="text-3xl font-semibold text-zinc-900">{product?.name || fallback?.name}</h1>
        <p className="text-xl text-zinc-700">
          ₦{(minPrice / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </p>
        <p className="max-w-lg text-zinc-600">
          {product?.description || fallback?.description || "Structured silhouette with breathable fabric, made for movement and warm weather layering."}
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 ${totalStock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
            {totalStock > 0 ? `${totalStock} available` : "Out of stock"}
          </span>
          {category ? <span className="rounded-full bg-zinc-100 px-3 py-1">{category}</span> : null}
          {showSubcategory ? <span className="rounded-full bg-zinc-100 px-3 py-1">{subcategory}</span> : null}
        </div>

        <ProductVariantPurchase
          slug={slug}
          sizes={sizes.map((size) => String(size))}
          colors={colors.map((color) => String(color))}
          totalStock={totalStock}
          fallbackEnabled={Boolean(fallback)}
          variants={(product?.variants || []).map((variant: ProductPageVariant) => ({
            id: variant.id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
          }))}
        />

        {(product?.material || product?.careInstructions || keyFeatures.length > 0) ? (
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
            {product?.material ? (
              <div>
                <p className="text-sm font-medium text-zinc-900">Material</p>
                <p className="mt-1 text-sm text-zinc-600">{product.material}</p>
              </div>
            ) : null}
            {product?.careInstructions ? (
              <div>
                <p className="text-sm font-medium text-zinc-900">Care instructions</p>
                <p className="mt-1 text-sm text-zinc-600">{product.careInstructions}</p>
              </div>
            ) : null}
            {keyFeatures.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-zinc-900">Key features</p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                  {keyFeatures.map((feature: string) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="hidden flex-wrap gap-2 text-xs">
          {sizes.map((size) => (
            <span key={String(size)} className="rounded-full border border-zinc-300 px-3 py-1">
              Size {String(size)}
            </span>
          ))}
          {colors.map((color) => (
            <span key={String(color)} className="rounded-full border border-zinc-300 px-3 py-1">
              {String(color)}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}
