"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
  const [savedIds, setSavedIds] = useState<string[]>([]);

  function toggleSaved(productId: string) {
    setSavedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }

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
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-4 drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                  />

                  <div className="pointer-events-none absolute right-3 top-3 z-20 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    <Link
                      href={product.href}
                      aria-label={`Search details for ${product.name}`}
                      className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-black text-white"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-white">
                        <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" strokeWidth="1.7" />
                        <path d="m21 21-4.3-4.3" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </Link>

                    <button
                      type="button"
                      aria-label={`Add ${product.name} to list`}
                      aria-pressed={savedIds.includes(product.id)}
                      title={savedIds.includes(product.id) ? "Added to list" : "Add to list"}
                      onClick={() => toggleSaved(product.id)}
                      className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-black text-white"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-white">
                        <path d="M12 5v14" strokeWidth="1.7" strokeLinecap="round" />
                        <path d="M5 12h14" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
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
