import Image from "next/image";
import Link from "next/link";
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
  id: string;
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

  if (!product || !product.isActive) {
    notFound();
  }

  const minPrice = product.variants.length
    ? Math.min(...product.variants.map((variant: ProductPageVariant) => variant.priceKobo))
    : 0;

  const heroImage =
    product?.images[0]?.cloudflareImageId && process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH
      ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${product.images[0].cloudflareImageId}/public`
      : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop";
  const imageAlt = product?.name || "TORÉA product";

  // Recently viewed products (client-side only)
  type ViewedProduct = { slug: string; name: string; image: string };

  let recentlyViewed: ViewedProduct[] = [];
  if (typeof window !== "undefined") {
    const viewed: ViewedProduct[] = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    if (!viewed.find((p) => p.slug === slug)) {
      viewed.unshift({ slug, name: product?.name || "", image: heroImage });
      if (viewed.length > 5) viewed.pop();
      localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
    }
    recentlyViewed = viewed.filter((p) => p.slug !== slug);
  }

  const sizes = Array.from(
    new Set([
      ...(Array.isArray(product.availableSizes) ? product.availableSizes.map((size: unknown) => String(size)) : []),
      ...product.variants.map((variant: ProductPageVariant) => variant.size).filter(Boolean).map((size: string | null) => String(size)),
    ]),
  );
  const colors = Array.from(
    new Set([
      ...(Array.isArray(product.availableColors) ? product.availableColors.map((color: unknown) => String(color)) : []),
      ...product.variants.map((variant: ProductPageVariant) => variant.color).filter(Boolean).map((color: string | null) => String(color)),
    ]),
  );
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

  // Fetch recommendations
  let recommendations: Array<{ id: string; slug: string; images?: Array<{ cloudflareImageId: string }>; name: string; variants?: Array<{ priceKobo: number }> }> = [];
  try {
    const recommendationsRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products/recommendations?productId=${product.id}`,
      { cache: "no-store" }
    );
    recommendations = recommendationsRes.ok ? await recommendationsRes.json() : [];
  } catch {}

  return (
    <div className="grid gap-8 pb-16 md:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100">
        <Image src={heroImage} alt={imageAlt} fill className="object-cover" />
      </div>
      <div className="space-y-5 relative">
        <h1 className="text-3xl font-semibold text-zinc-900">{product?.name}</h1>
        <p className="text-xl text-zinc-700">
          ₦{(minPrice / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </p>
        <p className="max-w-lg text-zinc-600">
          {product?.description || "Structured silhouette with breathable fabric, made for movement and warm weather layering."}
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
          fallbackEnabled={false}
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
        <Image
          src="https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/ChatGPT%20Image%20Mar%2011%2C%202026%20at%2011_11_55%20AM.png"
          alt="TORÉA Logo Background"
          width={320}
          height={120}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 opacity-10 pointer-events-none select-none"
          unoptimized
        />
      </div>
      {/* Recently Viewed Products */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Recently viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recentlyViewed.map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="block">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
                  <Image src={p.image} alt={p.name} width={120} height={150} className="object-cover w-full h-full" />
                </div>
                <p className="mt-2 text-sm font-medium text-zinc-900 truncate">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
      {recommendations && recommendations.length > 0 && (
        <div className="md:col-span-2">
          <div className="mt-20">
            <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {recommendations.map((product) => (
                <a key={product.id} href={`/product/${product.slug}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
                    {product.images?.[0]?.cloudflareImageId ? (
                      <Image
                        src={`https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${product.images[0].cloudflareImageId}/public`}
                        alt={product.name}
                        width={220}
                        height={275}
                        className="object-cover w-full h-full group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">No image</div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-zinc-900 truncate">{product.name}</p>
                  <p className="font-semibold text-zinc-700">
                    ₦{product.variants?.[0]?.priceKobo ? (product.variants[0].priceKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 }) : "-"}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
