import { redirect } from "next/navigation";

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q || "";
  if (typeof window !== "undefined") {
    // On client, redirect immediately
    window.location.replace(`/shop?q=${encodeURIComponent(q)}`);
    return null;
  }
  // On server, use Next.js redirect
  redirect(`/shop?q=${encodeURIComponent(q)}`);
  return null;
}
