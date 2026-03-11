"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  key: string;
  name: string;
  size: string;
  priceKobo: number;
  quantity: number;
  imageUrl: string;
};

const recommendations = [
  {
    id: "r1",
    name: "TORÉA Earth Fingerprint T-shirt in ecru",
    priceKobo: 5500000,
    href: "/product/earth-fingerprint-ecru",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "r2",
    name: "TORÉA Atlas T-shirt in washed grey",
    priceKobo: 4500000,
    href: "/product/atlas-washed-grey",
    imageUrl: "https://images.unsplash.com/photo-1464863979621-258859e62245?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "r3",
    name: "TORÉA Structured Kaftan",
    priceKobo: 6200000,
    href: "/product/structured-kaftan",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "r4",
    name: "TORÉA Linen Two Piece Set",
    priceKobo: 6900000,
    href: "/product/linen-two-piece-set",
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=400&auto=format&fit=crop",
  },
];

function formatNaira(priceKobo: number) {
  return `₦${(priceKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCart() {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { items: CartItem[] };
        if (mounted) {
          setItems(data.items || []);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      mounted = false;
    };
  }, []);

  async function mutateCart(key: string, action: "increment" | "decrement" | "remove") {
    const response = await fetch("/api/cart", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, action }),
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { items: CartItem[] };
    setItems(data.items || []);
    window.dispatchEvent(new Event("cart:updated"));
  }

  function increment(id: string) {
    void mutateCart(id, "increment");
  }

  function decrement(id: string) {
    void mutateCart(id, "decrement");
  }

  function removeItem(id: string) {
    void mutateCart(id, "remove");
  }

  async function clearCart() {
    const response = await fetch("/api/cart", { method: "DELETE" });
    if (!response.ok) {
      return;
    }

    setItems([]);
    window.dispatchEvent(new Event("cart:updated"));
  }

  const subtotalKobo = useMemo(
    () => items.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0),
    [items],
  );

  return (
    <div className="space-y-8 pb-20">
      <section className="py-8 text-center">
        <h1 className="font-display text-5xl">Cart</h1>
        <button
          type="button"
          onClick={clearCart}
          className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-600 underline underline-offset-4"
        >
          Clear cart
        </button>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            {loading ? (
              <p className="text-sm text-zinc-600">Loading cart...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-zinc-600">Your cart is currently empty.</p>
            ) : (
              items.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex gap-3">
                    <div className="relative h-20 w-16 overflow-hidden rounded-md bg-zinc-100">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-2">
                      <p className="max-w-sm text-sm font-medium text-zinc-900">{item.name}</p>
                      <p className="text-xs text-zinc-600">Size: {item.size}</p>
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center overflow-hidden rounded-md border border-zinc-300">
                          <button
                            type="button"
                            onClick={() => decrement(item.key)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 border-r border-zinc-300 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="inline-flex h-8 w-8 items-center justify-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => increment(item.key)}
                            className="h-8 w-8 border-l border-zinc-300"
                          >
                            +
                          </button>
                        </div>

                        <button type="button" onClick={() => removeItem(item.key)} className="text-xs underline underline-offset-2">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-zinc-900">{formatNaira(item.priceKobo * item.quantity)}</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Goes great with</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((item) => (
                <Link key={item.id} href={item.href} className="space-y-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <p className="line-clamp-2 text-sm text-zinc-800">{item.name}</p>
                  <p className="text-sm font-semibold">{formatNaira(item.priceKobo)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-zinc-700">Subtotal</span>
            <span className="font-semibold text-zinc-900">{formatNaira(subtotalKobo)}</span>
          </div>
          <div className="space-y-3">
            <Link href="/checkout" className="block rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white">
              Check out
            </Link>
            <Link href="/shop" className="block rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm">
              Continue shopping
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Taxes included. Shipping and discount codes calculated at checkout.
          </p>
        </aside>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-800">Subscribe today to hear first about our sales</p>
          <div className="flex w-full max-w-md gap-2">
            <input placeholder="Email address" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <button type="button" className="rounded-lg bg-black px-4 py-2 text-sm text-white">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-full border border-zinc-300 bg-white px-3 py-2 text-xs tracking-[0.18em]"
      >
        Share
      </button>

      <Link
        href="https://wa.me/2348012345678?text=Hi%20TOR%C3%89A%2C%20I%20need%20help%20with%20my%20order"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white"
        aria-label="WhatsApp"
      >
        💬
      </Link>

      <Link
        href="https://wa.me/2348012345678?text=Hi%20TOR%C3%89A%2C%20I%20need%20help%20with%20my%20order"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 rounded-full bg-black px-5 py-3 text-sm text-white"
      >
        Contact us
      </Link>

      <button
        type="button"
        className="fixed bottom-6 left-6 z-40 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs tracking-[0.18em]"
      >
        NGN ▾
      </button>
    </div>
  );
}
