"use client";
import { usePathname } from "next/navigation";
import VideoHeroBackground from "@/components/home/VideoHeroBackground";

export default function ClientHeroVideoWrapper() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <VideoHeroBackground />;
}
