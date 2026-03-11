"use client";

import { useMemo, useState } from "react";
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
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

export function ProductVariantPurchase({
  slug,
  sizes,
  colors,
  totalStock,
  variants,
  fallbackEnabled,
}: ProductVariantPurchaseProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [isAdding, setIsAdding] = useState(false);

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

  async function addSelectedToCart() {
    if (isAdding || (totalStock <= 0 && !fallbackEnabled)) {
      return;
    }

    try {
      setIsAdding(true);

      const key = selectedVariant ? `variant:${selectedVariant.id}` : `fallback:${slug}`;
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, action: "increment" }),
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
            {colors.map((color) => {
              const active = normalize(color) === normalize(selectedColor);
              return (
                <button
                  key={String(color)}
                  type="button"
                  onClick={() => setSelectedColor(String(color))}
                  className={`rounded-full border px-3 py-1 transition ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  {String(color)}
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
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isAdding ? "Adding..." : totalStock > 0 || fallbackEnabled ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </>
  );
}
