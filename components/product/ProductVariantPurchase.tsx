"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type VariantOption = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
};

type ProductVariantPurchaseProps = {
  slug: string;
  sizes: string[];
  colors: string[];
  totalStock: number;
  variants: VariantOption[];
  fallbackEnabled: boolean;
  images?: Array<{ color: string; imageUrl: string; cloudflareImageId?: string }>;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function encodeCartPart(value: string) {
  return encodeURIComponent(value.trim());
}

export function ProductVariantPurchase({
  slug,
  sizes,
  colors,
  totalStock,
  variants,
  fallbackEnabled,
  images = [],
}: ProductVariantPurchaseProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [isAdding, setIsAdding] = useState(false);

  // Find color images from variants (assume parent passes images array as prop)
  const colorImages = useMemo(() => {
    return Array.isArray(images)
      ? images.filter((img: { color?: string; imageUrl?: string }) => img.color && img.imageUrl)
      : [];
  }, [images]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) {
      return null;
    }

    const inStockVariants = variants.filter((variant) => variant.stock > 0);
    const source = inStockVariants.length > 0 ? inStockVariants : variants;

    const exact = source.find(
      (variant) =>
        normalize(variant.size) === normalize(selectedSize) &&
        normalize(variant.color) === normalize(selectedColor),
    );
    if (exact) {
      return exact;
    }

    const sizeOnly = source.find((variant) => normalize(variant.size) === normalize(selectedSize));
    if (sizeOnly) {
      return sizeOnly;
    }

    const colorOnly = source.find((variant) => normalize(variant.color) === normalize(selectedColor));
    if (colorOnly) {
      return colorOnly;
    }

    return source[0] || null;
  }, [variants, selectedSize, selectedColor]);

  const hasExactSelectedVariant = useMemo(
    () =>
      variants.some(
        (variant) =>
          normalize(variant.size) === normalize(selectedSize) &&
          normalize(variant.color) === normalize(selectedColor) &&
          variant.stock > 0,
      ),
    [variants, selectedSize, selectedColor],
  );

  async function addSelectedToCart() {
    if (isAdding || (totalStock <= 0 && !fallbackEnabled)) {
      return;
    }

    try {
      setIsAdding(true);

      const key = selectedVariant && hasExactSelectedVariant
        ? `variant:${selectedVariant.id}`
        : `fallback:${slug}::size=${encodeCartPart(selectedSize || "M")}::color=${encodeCartPart(selectedColor || "Default")}`;

      // Find imageUrl for selected color
      let imageUrl = "";
      if (images && images.length > 0) {
        const colorImg = images.find(
          (img) => normalize(img.color) === normalize(selectedColor)
        );
        if (colorImg) {
          imageUrl = colorImg.cloudflareImageId
            ? `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH || process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${colorImg.cloudflareImageId}/public`
            : colorImg.imageUrl || "";
        }
      }

      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, action: "increment", imageUrl }),
      });

      if (!response.ok) {
        return;
      }

      window.dispatchEvent(new Event("cart:updated"));
      router.push("/cart");
      router.refresh();
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <>
      {/* Color thumbnails grid */}
      {colorImages.length > 0 && (
        <div className="mb-4 flex gap-2">
          {colorImages.map(({ color, imageUrl }: { color: string; imageUrl: string }) => {
            const active = normalize(color) === normalize(selectedColor);
            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(String(color))}
                className={`relative rounded-md border transition ${active ? "border-black ring-2 ring-black" : "border-zinc-300"}`}
                style={{ padding: 0, width: 48, height: 48 }}
                aria-label={`Select color ${color}`}
              >
                <Image
                  src={imageUrl}
                  alt={color}
                  width={48}
                  height={48}
                  className="object-cover rounded-md"
                />
                {active && (
                  <span className="absolute inset-0 rounded-md ring-2 ring-black pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      )}
      <div className="space-y-3">
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-900">Available sizes</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {sizes.map((size) => {
              const active = normalize(size) === normalize(selectedSize);
              return (
                <button
                  key={String(size)}
                  type="button"
                  onClick={() => setSelectedSize(String(size))}
                  className={`rounded-full border px-3 py-1 transition ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  {String(size)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-900">Available colors</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[...new Set(colors.map(c => normalize(c)))].map((color) => {
              const active = color === normalize(selectedColor);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-full border px-3 py-1 transition ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={addSelectedToCart}
          disabled={isAdding || (totalStock <= 0 && !fallbackEnabled)}
          className="inline-flex items-center rounded-full border border-black bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          {isAdding ? "Adding..." : totalStock > 0 || fallbackEnabled ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </>
  );
}
