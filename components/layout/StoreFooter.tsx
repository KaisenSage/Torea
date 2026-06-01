"use client";

import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

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
    <footer className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffdf9_0%,#fff8f1_58%,#fdf4ea_100%)] px-5 py-7 shadow-[0_22px_55px_rgba(181,145,110,0.08)] sm:px-7 sm:py-8 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,_rgba(255,244,222,0.8),_transparent_48%),radial-gradient(circle_at_top_right,_rgba(255,231,220,0.55),_transparent_36%)]" />
      <div className="pointer-events-none absolute -bottom-10 left-[2%] h-36 w-28 rounded-t-[999px] bg-[#f5dfcf]/55" />
      <div className="pointer-events-none absolute bottom-0 left-[24%] h-44 w-32 rounded-t-[999px] bg-[#f7e6d8]/72" />
      <div className="pointer-events-none absolute -bottom-5 left-[46%] h-28 w-22 rounded-t-[999px] bg-[#f1d8ca]/50" />
      <div className="pointer-events-none absolute bottom-0 right-[18%] h-40 w-30 rounded-t-[999px] bg-[#f7e6d7]/68" />
      <div className="pointer-events-none absolute -bottom-7 right-[3%] h-34 w-24 rounded-t-[999px] bg-[#efd8ca]/52" />

      <div className="relative grid gap-7 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr_0.95fr] lg:items-start">
        <div className="max-w-md">
          <Image
            src="https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/ChatGPT%20Image%20Mar%2011%2C%202026%20at%2011_11_55%20AM.png"
            alt="TORÉA"
            width={138}
            height={56}
            className="h-auto w-[120px] object-contain sm:w-[138px]"
            unoptimized
          />
          <div className="mt-5 flex gap-3 sm:gap-4">
            <a href="https://www.instagram.com/heytoreah?igsh=b2R4anpmb3g2dTdi" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="h-5 w-5 text-[#715845] transition hover:text-[#d2644d] sm:h-6 sm:w-6" />
            </a>
            <a href="https://www.tiktok.com/@heytoreah?_r=1&_t=ZS-94bHbrhDwa9" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok className="h-5 w-5 text-[#715845] transition hover:text-[#2f241c] sm:h-6 sm:w-6" />
            </a>
            <a href="https://wa.me/2349135828246" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp className="h-5 w-5 text-[#715845] transition hover:text-[#3d9b67] sm:h-6 sm:w-6" />
            </a>
            <a href="mailto:Heytoreah@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email">
              <FaEnvelope className="h-5 w-5 text-[#715845] transition hover:text-[#8a6ccf] sm:h-6 sm:w-6" />
            </a>
          </div>
        </div>

        <div className="border-t border-[#eadbcc] pt-4 sm:border-t-0 sm:pt-0 lg:pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f6f53]">Shop</p>
          <ul className="mt-3 space-y-2.5 text-sm text-[#5d4c3f] sm:mt-4 sm:space-y-3">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-[#241b15]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[#eadbcc] pt-4 sm:border-t-0 sm:pt-0 lg:pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f6f53]">Support</p>
          <ul className="mt-3 space-y-2.5 text-sm text-[#5d4c3f] sm:mt-4 sm:space-y-3">
            <li>
              <Link href="/checkout" className="transition hover:text-[#241b15]">
                Secure checkout
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-[#241b15]">
                Track your order items
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="transition hover:text-[#241b15]">
                Refund &amp; Return Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative mt-7 flex flex-col gap-2.5 border-t border-[#e7d7c6] pt-4 text-[11px] text-[#8a7562] sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-5 sm:text-xs">
        <span>© {currentYear()} TORÉA. All rights reserved.</span>
        <a
          href="https://www.codewithsage.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#695140] transition hover:text-[#241b15]"
        >
          Powered by CodewithSage
        </a>
      </div>
    </footer>
  );
}
