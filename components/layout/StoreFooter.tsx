"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaWhatsapp, FaTiktok, FaEnvelope } from "react-icons/fa";

const quickLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "Tops", href: "/shop?category=tops" },
  { label: "Bottoms", href: "/shop?category=bottoms" },
  { label: "Cart", href: "/cart" },
];

function currentYear() {
  return new Date().getFullYear();
}

export function StoreFooter() {
  return (
    <footer className="mt-12 rounded-3xl border border-zinc-200 bg-white px-6 py-8 sm:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image
            src="https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/ChatGPT%20Image%20Mar%2011%2C%202026%20at%2011_11_55%20AM.png"
            alt="TORÉA"
            width={120}
            height={48}
            className="object-contain"
            unoptimized
          />
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-600">
            Wear elite. Train hard.
          </p>
          <div className="mt-4 flex gap-4">
            <a href="https://www.instagram.com/heytoreah?igsh=b2R4anpmb3g2dTdi" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="h-7 w-7 text-zinc-700 hover:text-pink-500 transition" />
            </a>
            <a href="https://www.tiktok.com/@heytoreah?_r=1&_t=ZS-94bHbrhDwa9" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok className="h-7 w-7 text-zinc-700 hover:text-black transition" />
            </a>
            <a href="https://wa.me/2348080523590" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp className="h-7 w-7 text-zinc-700 hover:text-green-500 transition" />
            </a>
            <a href="mailto:Heytoreah@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email">
              <FaEnvelope className="h-7 w-7 text-zinc-700 hover:text-blue-500 transition" />
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-zinc-900">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>
              <Link href="/checkout" className="transition hover:text-zinc-900">
                Secure checkout
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-zinc-900">
                Track your order items
              </Link>
            </li>
            <li>
              <a href="mailto:hello@torea.store" className="transition hover:text-zinc-900">
                hello@torea.store
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
        <span>© {currentYear()} TORÉA. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a
            href="https://www.codewithsage.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-zinc-700 hover:underline"
          >
            Powered by CodewithSage
          </a>
        </div>
      </div>
    </footer>
  );
}
