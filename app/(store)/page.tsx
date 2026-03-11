import FeaturedProductsSection from "@/components/featured/FeaturedProductsSection";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";

const featured = [
  {
    id: "1",
    name: "TORÉA Island Dream Club T-shirt in black",
    href: "/product/dream-club-black",
    imageUrl: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=1200&auto=format&fit=crop",
    priceKobo: 4000000,
  },
  {
    id: "2",
    name: "TORÉA Earth Fingerprint T-shirt in ecru",
    href: "/product/earth-fingerprint-ecru",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    priceKobo: 4000000,
  },
  {
    id: "3",
    name: "TORÉA Dream Club T-shirt in soft ecru",
    href: "/product/dream-club-ecru",
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1200&auto=format&fit=crop",
    priceKobo: 4000000,
  },
  {
    id: "4",
    name: "TORÉA Atlas T-shirt in washed grey",
    href: "/product/atlas-washed-grey",
    imageUrl: "https://images.unsplash.com/photo-1464863979621-258859e62245?q=80&w=1200&auto=format&fit=crop",
    priceKobo: 4500000,
  },
  {
    id: "5",
    name: "TORÉA Destiny print T-shirt in black",
    href: "/product/destiny-print-black",
    imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=1200&auto=format&fit=crop",
    priceKobo: 4000000,
  },
];

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

  const featuredProducts =
    dbProducts.length > 0
      ? dbProducts.map((product) => ({
          id: product.id,
          name: product.name,
          href: `/product/${product.slug}`,
          imageUrl:
            product.images[0]?.cloudflareImageId
              ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${product.images[0].cloudflareImageId}/public`
              : "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=1200&auto=format&fit=crop",
          priceKobo: product.variants[0]?.priceKobo ?? 0,
        }))
      : featured;

  return (
    <div className="space-y-12 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_10%_20%,#fff7ed_0%,#ffedd5_28%,#fde68a_100%)] px-6 py-16 sm:px-10">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-zinc-700">TORÉA</p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
          Elevated essentials for every DETTY DECEMBER moment.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-zinc-700 sm:text-base">
          Discover clean silhouettes, signature prints, and premium ready-to-wear designed for Nigeria.
        </p>
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

      <FeaturedProductsSection products={featuredProducts} viewAllHref="/shop" />
    </div>
  );
}
