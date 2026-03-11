"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const announcementMessages = ["Wear elite. Train hard.", "Welcome to our store."];

const shopLinks = [
  { href: "/shop?sort=price-asc", label: "New Arrivals" },
  { href: "/shop?category=tops&sort=latest", label: "Tops" },
  { href: "/shop?category=bottoms&sort=latest", label: "Bottoms" },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5">
      {children}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadCartCount() {
      try {
        const response = await fetch("/api/cart/count", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { count?: number };
        if (mounted) {
          setCartCount(data.count ?? 0);
        }
      } catch {
        if (mounted) {
          setCartCount(0);
        }
      }
    }

    void loadCartCount();

    function onCartUpdated() {
      void loadCartCount();
    }

    window.addEventListener("cart:updated", onCartUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("cart:updated", onCartUpdated);
    };
  }, [pathname]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setAnnouncementIndex((current) => (current + 1) % announcementMessages.length);
    }, 3200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="font-display sticky top-0 z-40 w-full border-b border-black/10 bg-[var(--header-bg)]">
      <div className="border-b border-black/10 bg-black px-4 py-2 text-center text-[10px] uppercase tracking-[0.28em] text-white sm:text-[11px]">
        {announcementMessages[announcementIndex]}
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative text-[11px] uppercase tracking-[0.22em]">
              <button
                className="inline-flex items-center gap-2 transition hover:opacity-70"
                type="button"
                onClick={() => setCurrencyMenuOpen((prev) => !prev)}
                aria-expanded={currencyMenuOpen}
                aria-label="Select currency"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-black/80">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" strokeWidth="1.5" />
                  <path d="M2 12h20" strokeWidth="1.5" />
                  <path
                    d="M12 2c2.5 2.7 4 6.2 4 10s-1.5 7.3-4 10c-2.5-2.7-4-6.2-4-10s1.5-7.3 4-10Z"
                    strokeWidth="1.5"
                  />
                </svg>
                <svg width="16" height="12" viewBox="0 0 48 36" aria-hidden="true" className="rounded-[1px]">
                  <rect width="16" height="36" fill="#008751" />
                  <rect x="16" width="16" height="36" fill="#ffffff" />
                  <rect x="32" width="16" height="36" fill="#008751" />
                </svg>
                <span>NGN</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-black/70">
                  <path d="m6 9 6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {currencyMenuOpen ? (
                <div className="absolute left-0 top-7 min-w-24 border border-black/10 bg-[var(--header-bg)] p-2 text-[10px] uppercase tracking-[0.2em]">
                  <button type="button" className="flex w-full items-center gap-2 text-left opacity-80">
                    <svg width="16" height="12" viewBox="0 0 48 36" aria-hidden="true" className="rounded-[1px]">
                      <rect width="16" height="36" fill="#008751" />
                      <rect x="16" width="16" height="36" fill="#ffffff" />
                      <rect x="32" width="16" height="36" fill="#008751" />
                    </svg>
                    NGN
                  </button>
                </div>
              ) : null}
            </div>

            <Link href="/" className="font-display text-[22px] uppercase tracking-[0.2em] sm:text-[24px]" aria-label="Home">
              TORÉA
            </Link>
          </div>

          <nav className="hidden items-center gap-5 text-[11px] uppercase tracking-[0.24em] md:flex">
            <Link className="transition hover:opacity-70" href="/">
              Home
            </Link>

            <div
              className="relative -mb-4 pb-4"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
              onFocus={() => setShopMenuOpen(true)}
              onBlur={() => setShopMenuOpen(false)}
            >
              <button
                className="inline-flex items-center gap-1 transition hover:opacity-70"
                onClick={() => setShopMenuOpen((prev) => !prev)}
                type="button"
                aria-expanded={shopMenuOpen}
                aria-label="Open shop categories"
              >
                Shop
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-black/70">
                  <path d="m6 9 6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {shopMenuOpen ? (
                <div className="absolute left-0 top-full z-20 min-w-44 pt-2">
                  <div className="border border-black/10 bg-[var(--header-bg)] p-3 text-[10px] uppercase tracking-[0.22em] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
                  {shopLinks.map((link) => (
                    <Link
                      key={link.href}
                      className="block rounded-md px-2 py-2 transition hover:bg-black/5"
                      href={link.href}
                      onClick={() => setShopMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  </div>
                </div>
              ) : null}
            </div>

            <Link href="/search" aria-label="Search">
              <Icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-black/80">
                  <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" strokeWidth="1.5" />
                  <path d="m21 21-4.3-4.3" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Icon>
            </Link>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="transition hover:opacity-70" type="button">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  className="h-9 rounded-md border border-black/70 px-4 text-[11px] uppercase tracking-[0.2em] transition hover:bg-black/5"
                  type="button"
                >
                  Create Account
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
            </Show>

            <Link href="/cart" className="relative" aria-label="Cart">
              <Icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-black/80">
                  <path d="M6 8h12l-1 13H7L6 8Z" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9 8a3 3 0 0 1 6 0" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Icon>
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] leading-none text-white">
                {cartCount}
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-black/80">
                <path d="M4 7h16" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4 12h16" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4 17h16" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[var(--header-bg)] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-[18px] uppercase tracking-[0.25em]">TORÉA</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="h-10 w-10 rounded-full transition hover:bg-black/5"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-black/80">
                  <path d="M6 6l12 12" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M18 6L6 18" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-8 space-y-5 text-[12px] uppercase tracking-[0.28em]">
              <Link onClick={() => setOpen(false)} className="block" href="/">
                Home
              </Link>
              <Link onClick={() => setOpen(false)} className="block" href="/shop">
                Shop
              </Link>
              <div className="pl-2 text-[10px] tracking-[0.2em] text-black/70">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => setMobileShopOpen((prev) => !prev)}
                  aria-expanded={mobileShopOpen}
                >
                  Categories
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-black/70">
                    <path d="m6 9 6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {mobileShopOpen ? (
                  <div className="mt-3 space-y-2 text-[10px] uppercase tracking-[0.2em] text-black/85">
                    {shopLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="block" onClick={() => setOpen(false)}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
              <Link onClick={() => setOpen(false)} className="block" href="/search">
                Search
              </Link>
              <Link onClick={() => setOpen(false)} className="block" href="/cart">
                Cart
              </Link>

              <div className="border-t border-black/10 pt-4" />

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="block w-full text-left" type="button">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    className="mt-4 h-10 w-full rounded-md border border-black/70 px-4 text-left transition hover:bg-black/5"
                    type="button"
                  >
                    Create Account
                  </button>
                </SignUpButton>
              </Show>

              <Show when="signed-in">
                <div className="flex items-center justify-between">
                  <span>Account</span>
                  <UserButton />
                </div>
              </Show>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
