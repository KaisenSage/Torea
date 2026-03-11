"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ProductCardProps = {
  slug: string;
  name: string;
  priceKobo: number;
  imageUrl: string;
  cartKey: string;
  canAdd?: boolean;
};

export function ProductCard({
  slug,
  name,
  priceKobo,
  imageUrl,
  cartKey,
  canAdd = true,
}: ProductCardProps) {
  const reducedMotion = useReducedMotion();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!canAdd || isAdding) {
      return;
    }

    try {
      setIsAdding(true);

      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: cartKey, action: "increment" }),
      });

      if (!response.ok) {
        return;
      }

      setAdded(true);
      window.dispatchEvent(new Event("cart:updated"));
      window.setTimeout(() => setAdded(false), 1400);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <motion.article
      className="group relative overflow-visible rounded-2xl border border-zinc-100 bg-white"
      whileHover={reducedMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-[3/4]">
        <div className="relative h-full w-full overflow-hidden">
          <Link href={`/product/${slug}`} className="absolute inset-0 z-10" aria-label={`Open ${name}`} />
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd || isAdding}
          aria-label={
            !canAdd
              ? `${name} is out of stock`
              : isAdding
                ? `Adding ${name} to cart`
                : added
                  ? `${name} added to cart`
                  : `Add ${name} to cart`
          }
          className="absolute right-2 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white opacity-100 shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-zinc-500 sm:right-3 sm:top-3 sm:h-9 sm:w-9 lg:-right-4 lg:top-4 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
        >
          {!canAdd ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-white">
              <path d="M6 6l12 12" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M18 6L6 18" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : added ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-white">
              <path d="m5 12 5 5 9-9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-white">
              <path d="M12 5v14" strokeWidth="2" strokeLinecap="round" />
              <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      <Link href={`/product/${slug}`} className="block">
        <div className="space-y-1 p-4">
          <h3 className="font-semibold text-zinc-900">{name}</h3>
          <p className="text-sm text-zinc-600">
            ₦{(priceKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
