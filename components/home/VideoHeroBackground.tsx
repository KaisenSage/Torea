"use client";

export default function VideoHeroBackground() {
  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-center">
      <video
        src="https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/IMG_0353.MP4"
        autoPlay
        loop
        muted
        playsInline
        poster="https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/torea-tops.webp"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      {/* Overlay content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-3xl font-bold text-white drop-shadow-md sm:text-4xl">
          Discover TORÉA
        </h1>
        <p className="mt-2 text-sm text-white drop-shadow-sm">
          Premium gym &amp; fitness apparel built for performance.
        </p>
        <a
          href="/shop"
          className="mt-4 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
        >
          Shop now
        </a>
      </div>
    </div>
  );
}
