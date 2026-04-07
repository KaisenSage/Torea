"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ProductVariant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
};

type ProductCardProps = {
  slug: string;
  name: string;
  priceKobo: number;
  imageUrls: string[]; // array of images
  cartKey: string;
  canAdd?: boolean;
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  totalStock?: number;
  fallbackEnabled?: boolean;
  images?: Array<{ imageUrl: string; r2Url?: string; cloudflareImageId?: string } | string>;
};

export function ProductCard(props: ProductCardProps) {
  const { slug, name, priceKobo, cartKey, canAdd = true } = props;
  // Use product.images (from DB) or imageUrls prop for dynamic images
  let imageUrls: string[] = [];
  if (props.images && Array.isArray(props.images) && props.images.length > 0) {
    imageUrls = props.images
      .map((img: { imageUrl: string; r2Url?: string; cloudflareImageId?: string } | string) => {
        if (typeof img === "string") return img;
        if (props.name && props.name.toLowerCase().includes("charme set") && img.r2Url) {
          return img.r2Url;
        }
        return img.cloudflareImageId
          ? `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH || process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${img.cloudflareImageId}/public`
          : img.imageUrl;
      })
      .filter(Boolean);
  } else if (props.imageUrls && props.imageUrls.length > 0) {
    imageUrls = props.imageUrls;
  }
  const reducedMotion = useReducedMotion();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [currentImage] = useState(0);

  async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!canAdd || isAdding) return;

    try {
      setIsAdding(true);
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: cartKey, action: "increment" }),
      });
      if (!response.ok) return;

      setAdded(true);
      window.dispatchEvent(new Event("cart:updated"));
      setTimeout(() => setAdded(false), 1400);
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
        <Link href={`/product/${slug}`} className="absolute inset-0 z-10" aria-label={`Open ${name}`} />
        {/* Main Image */}
        {imageUrls.length > 0 && imageUrls[currentImage] ? (
          <Image
            src={imageUrls[currentImage]}
            alt={name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        {/* Hide thumbnails for Luxe Set, Elevate Jacket Short Hand, Elevate Jacket Long Hands, Peak Fit, Aero Sculpt Jumpsuit in product card */}
        {/* Left-side vertical thumbnail grid removed as requested */}
        {/* All thumbnails removed from product card. Only main image is shown in product grid/shop/category. */}
        {/* Add to Cart Button */}
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
          className="absolute right-2 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-zinc-500 sm:right-3 sm:top-3 sm:h-9 sm:w-9 lg:-right-4 lg:top-4 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
        >
          {added || isAdding ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-white">
              <path d="m5 12 5 5 9-9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : !canAdd ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-white">
              <path d="M6 6l12 12" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M18 6L6 18" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-white">
              <path d="M12 5v14" strokeWidth="2" strokeLinecap="round" />
              <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Product Info */}
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