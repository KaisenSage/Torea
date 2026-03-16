"use client";

import { useMemo } from "react";
import { ProductCard } from "@/components/product/ProductCard";

type ShopGridItem = {
  id: string;
  slug: string;
  name: string;
  minPriceKobo: number;
  totalStock: number;
  colors: string[];
  imageUrl: string;
  cartKey: string;
};

export function ShopProductGrid({ items }: { items: ShopGridItem[] }) {
  const cards = useMemo(
    () =>
      items.map((item) => (
        <div key={item.id} className="space-y-2 lg:pr-4">
          <ProductCard
            slug={item.slug}
            name={item.name}
            priceKobo={item.minPriceKobo}
            cartKey={item.cartKey}
            canAdd={item.totalStock > 0}
            imageUrls={[item.imageUrl]}
          />
          {item.slug !== "charme-set" && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-zinc-100 px-2 py-1">
                {item.totalStock > 0 ? `${item.totalStock} in stock` : "Out of stock"}
              </span>
              {item.colors.slice(0, 2).map((color) => (
                <span key={String(color)} className="rounded-full bg-zinc-100 px-2 py-1">
                  {String(color)}
                </span>
              ))}
            </div>
          )}
        </div>
      )),
    [items],
  );

  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{cards}</div>;
}
