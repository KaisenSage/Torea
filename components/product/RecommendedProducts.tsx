import Image from "next/image";
import Link from "next/link";

type ProductItem = {
  id: string;
  slug: string;
  name: string;
  images?: Array<{ cloudflareImageId: string }>;
  variants?: Array<{ priceKobo: number }>;
};

export default function RecommendedProducts({ products }: { products: ProductItem[] }) {
  if (!products || products.length === 0) return null;

  const filteredProducts = products.filter((product) => product.name.toLowerCase() !== "bum covers");

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {filteredProducts.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`} className="group block">
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
              {product.images?.[0]?.cloudflareImageId ? (
                <Image
                  src={
                    product.images[0].cloudflareImageId.startsWith("http://") ||
                    product.images[0].cloudflareImageId.startsWith("https://")
                      ? product.images[0].cloudflareImageId
                      : process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH
                        ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${product.images[0].cloudflareImageId}/public`
                        : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
                  }
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
          </Link>
        ))}
      </div>
    </div>
  );
}
