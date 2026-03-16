"use client";
import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "Tops",
    href: "/shop?category=tops",
    img: "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_0671.PNG",
    alt: "Toréa women's tops collection",
  },
  {
    name: "Bottoms",
    href: "/shop?category=bottoms",
    img: "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_0681.PNG",
    alt: "Toréa women's bottoms collection",
  },
  {
    name: "Two Piece",
    href: "/shop?category=two%20piece",
    img: "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_0805.PNG",
    alt: "Toréa women's two piece collection",
  },
  {
    name: "Jumpsuit",
    href: "/shop?category=jumpsuits",
    img: "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_0465.PNG",
    alt: "Toréa women's jumpsuit collection",
  },
];

export default function ShopByCategorySection() {
  return (
    <section className="mx-auto max-w-6xl py-16 px-4 sm:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">SHOP BY CATEGORY</h2>
        <p className="mt-3 text-lg text-zinc-500">Discover our curated styles</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            aria-label={cat.name}
            className="group block rounded-xl bg-[#f5f5f5] p-4 text-center transition-shadow hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-black"
          >
            <div className="category-card relative mx-auto w-full h-[200px] overflow-hidden rounded-lg bg-white flex items-center justify-center">
              <Image
                src={cat.img}
                alt={cat.alt}
                width={800}
                height={800}
                loading="lazy"
                className="object-contain w-full h-full transition-transform duration-400 group-hover:scale-105"
              />
            </div>
            <div className="mt-6 text-xl font-semibold tracking-wide uppercase text-zinc-900 group-hover:text-black">{cat.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

