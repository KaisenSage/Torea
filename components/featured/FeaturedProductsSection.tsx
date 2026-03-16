"use client";

import Image from "next/image";
import Link from "next/link";

type FeaturedProduct = {
  id: string;
  name: string;
  href: string;
  imageUrl: string;
  priceKobo: number;
};

function formatNairaFromKobo(priceKobo: number) {
  const value = priceKobo / 100;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace("NGN", "₦");
}

export default function FeaturedProductsSection({
  title = "Explore TORÉA",
  viewAllHref = "/shop",
  products,
}: {
  title?: string;
  viewAllHref?: string;
  products: FeaturedProduct[];
}) {

  return (
    <section className="w-full py-10" id="featured-products">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-start justify-between gap-6">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {title}
          </h2>

          <Link
            href={viewAllHref}
            className="shrink-0 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-400"
          >
            View all
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <article key={product.id} className="group">
              <div className="block">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f3f4f6]">
                  <Link href={product.href} className="absolute inset-0 z-10" aria-label={`Open ${product.name}`} />
                  <Image
                    src={product.name.toLowerCase().includes("charme set")
                      ? "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_0681.PNG"
                      : product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-4 drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-5 space-y-2">
                  <p className="line-clamp-2 text-sm leading-6 text-black/90">{product.name}</p>
                  <p className="text-lg font-semibold tracking-tight text-zinc-900">
                    {formatNairaFromKobo(product.priceKobo)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
