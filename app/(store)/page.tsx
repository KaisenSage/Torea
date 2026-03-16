import FeaturedProductsSection from "@/components/featured/FeaturedProductsSection";
import HomeExperienceSections from "@/components/home/HomeExperienceSections";
import ShopByCategorySection from "@/components/home/ShopByCategorySection";
import { AppearOnScroll } from "@/components/AppearOnScroll";
import { prisma } from "@/server/db/prisma";

export default async function StoreHomePage() {
  let dbProducts: Array<{
    id: string;
    name: string;
    slug: string;
    images: Array<{ cloudflareImageId: string | null }>;
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
    imageUrl: (() => {
      const rawId = product.images[0]?.cloudflareImageId;
      const fallback =
        "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=1200&auto=format&fit=crop";

      if (!rawId) {
        return fallback;
      }

      if (rawId.startsWith("http://") || rawId.startsWith("https://")) {
        return rawId;
      }

      if (process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH) {
        return `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${rawId}/public`;
      }

      return fallback;
    })(),
    priceKobo: product.variants[0]?.priceKobo ?? 0,
  }));

  return (
    <div className="space-y-12 pb-16">
      <AppearOnScroll>
        <div className="appear-on-scroll">
          <ShopByCategorySection />
        </div>
      </AppearOnScroll>

      {featuredProducts.length > 0 ? (
        <AppearOnScroll>
          <div className="appear-on-scroll">
            <FeaturedProductsSection products={featuredProducts} viewAllHref="/shop" />
          </div>
        </AppearOnScroll>
      ) : null}

      <AppearOnScroll>
        <div className="appear-on-scroll">
          <HomeExperienceSections />
        </div>
      </AppearOnScroll>
    </div>
  );
}
