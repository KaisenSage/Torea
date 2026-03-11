import FeaturedProductsSection from "@/components/featured/FeaturedProductsSection";
import HomeExperienceSections from "@/components/home/HomeExperienceSections";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";

export default async function StoreHomePage() {
  let dbProducts: Array<{
    id: string;
    name: string;
    slug: string;
    images: Array<{ cloudflareImageId: string }>;
    variants: Array<{ priceKobo: number }>;
  }> = [];

  try {
    dbProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 5,
      include: {
        variants: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });
  } catch {
    dbProducts = [];
  }

  const featuredProducts = dbProducts.map((product) => ({
    id: product.id,
    name: product.name,
    href: `/product/${product.slug}`,
    imageUrl:
      product.images[0]?.cloudflareImageId
        ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${product.images[0].cloudflareImageId}/public`
        : "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=1200&auto=format&fit=crop",
    priceKobo: product.variants[0]?.priceKobo ?? 0,
  }));

  return (
    <div className="space-y-12 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-[radial-gradient(circle_at_12%_18%,#fff7ed_0%,#ffe8cc_32%,#ffd7a8_62%,#f4f4f5_100%)] px-6 py-16 sm:px-10">
        <div className="absolute -right-20 top-0 h-60 w-60 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />

        <p className="relative mb-4 text-xs uppercase tracking-[0.3em] text-zinc-700">TORÉA</p>
        <h1 className="relative max-w-3xl text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
          Explore TORÉA
        </h1>
        <p className="relative mt-4 max-w-2xl text-sm text-zinc-700 sm:text-base">
          Elevate your training, recovery, and everyday motion with premium gym and fitness apparel. Engineered for comfort, performance, and confidence—TORÉA is where style meets strength.
        </p>

        <div className="relative mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Shop TORÉA
          </Link>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {[
          { label: "All", href: "/shop" },
          { label: "New Arrivals", href: "/shop?sort=price-asc" },
          { label: "Tops", href: "/shop?category=tops&sort=latest" },
          { label: "Bottoms", href: "/shop?category=bottoms&sort=latest" },
        ].map((chip) => (
          <Link
            key={chip.label}
            href={chip.href}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-400"
          >
            {chip.label}
          </Link>
        ))}
      </section>

      {featuredProducts.length > 0 ? <FeaturedProductsSection products={featuredProducts} viewAllHref="/shop" /> : null}

      <HomeExperienceSections />
    </div>
  );
}
