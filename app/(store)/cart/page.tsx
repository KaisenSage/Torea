"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaTrash } from "react-icons/fa";

type CartItem = {
  key: string;
  name: string;
  size: string;
  color: string;
  priceKobo: number;
  quantity: number;
  imageUrl: string;
};

function formatNaira(priceKobo: number) {
  return `₦${(priceKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

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

  async function subscribeNewsletter() {
    const email = newsletterEmail.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    setNewsletterMessage(null);
    setNewsletterError(null);

    if (!isValidEmail) {
      setNewsletterError("Enter a valid email address.");
      return;
    }

    try {
      setIsSubscribing(true);
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };

      if (!response.ok || !data.ok) {
        setNewsletterError(data.error || "Unable to subscribe right now.");
        return;
      }

      setNewsletterMessage(data.message || "You are now subscribed.");
      setNewsletterEmail("");
    } catch {
      setNewsletterError("Unable to subscribe right now.");
    } finally {
      setIsSubscribing(false);
    }
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
          className="mt-4 rounded-full border border-red-600 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-black transition hover:bg-red-600 hover:text-white"
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
                      <Image
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.name + (item.color ? ` (${item.color})` : "")}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="max-w-sm text-sm font-medium text-zinc-900">{item.name}</p>
                      <p className="text-xs text-zinc-600">Size: {item.size} • Color: {item.color}</p>
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

                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="ml-2 rounded-full border border-zinc-300 bg-white p-2 text-zinc-500 hover:text-red-600 hover:border-red-600 transition"
                          aria-label="Remove item"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-zinc-900">{formatNaira(item.priceKobo * item.quantity)}</p>
                </div>
              ))
            )}
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
            <input
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="Email address"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={subscribeNewsletter}
              disabled={isSubscribing}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {isSubscribing ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
        </div>
        {newsletterMessage ? <p className="mt-3 text-sm text-emerald-700">{newsletterMessage}</p> : null}
        {newsletterError ? <p className="mt-3 text-sm text-red-600">{newsletterError}</p> : null}
      </section>

    </div>
  );
}
