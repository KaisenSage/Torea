import Link from "next/link";

function resolveInstagramUrl() {
  const rawValue = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://instagram.com/";

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  if (rawValue.startsWith("ttps://")) {
    return `h${rawValue}`;
  }

  if (rawValue.startsWith("//")) {
    return `https:${rawValue}`;
  }

  return `https://${rawValue.replace(/^\/+/, "")}`;
}

const instagramUrl = resolveInstagramUrl();

export function InstagramContactButton() {
  return (
    <Link
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact TORÉA on Instagram"
      className="fixed right-4 top-1/2 z-40 inline-flex -translate-y-1/2 items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-2 text-xs font-medium tracking-[0.12em] text-zinc-900 shadow-sm transition hover:bg-zinc-50 sm:right-6"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-black/80">
        <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
      <span className="hidden sm:inline">CONTACT</span>
    </Link>
  );
}
