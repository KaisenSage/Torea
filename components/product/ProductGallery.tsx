"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryImage = { cloudflareImageId: string; color?: string };

interface ProductGalleryProps {
  images?: ProductGalleryImage[];
  name?: string;
  colors?: string[];
  cloudflareHash?: string;
}

export default function ProductGallery({ images = [], name = "", colors = [], cloudflareHash = "" }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  return (
    <div className="flex w-full">
      {/* Thumbnails vertical on left */}
      <div className="flex flex-col gap-2 pr-4">
        {images.length > 0 ? (
          images.map((img, idx) => (
            <button
              key={img.cloudflareImageId || idx}
              type="button"
              onClick={() => setSelectedImage(idx)}
              className={`border rounded-lg overflow-hidden focus:outline-none ${selectedImage === idx ? 'border-black ring-2 ring-black' : 'border-zinc-200'}`}
              style={{ width: 60, height: 80 }}
              aria-label={`Select image ${idx + 1}`}
            >
              <Image
                src={img.cloudflareImageId && cloudflareHash
                  ? `https://imagedelivery.net/${cloudflareHash}/${img.cloudflareImageId}/public`
                  : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"}
                alt={name + " " + (img.color ? img.color : "")}
                width={60}
                height={80}
                className="object-cover w-full h-full"
                sizes="60px"
                priority={idx === 0}
              />
              <span className="text-xs mt-1 text-center break-words w-full">{img.color ? img.color : ""}</span>
            </button>
          ))
        ) : null}
      </div>
      {/* Main image large on right */}
      <div className="flex-1 flex items-center justify-center">
        {images.length > 0 ? (
          <Image
            src={images[selectedImage]?.cloudflareImageId && cloudflareHash
              ? `https://imagedelivery.net/${cloudflareHash}/${images[selectedImage].cloudflareImageId}/public`
              : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"}
            alt={name + " " + (images[selectedImage]?.color ? images[selectedImage].color : "")}
            width={400}
            height={500}
            className="rounded-2xl object-cover border border-zinc-200 w-full max-w-[400px] max-h-[500px]"
            sizes="(max-width: 640px) 100vw, 400px"
            priority
          />
        ) : (
          <Image
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
            alt={name}
            width={400}
            height={500}
            className="rounded-2xl object-cover border border-zinc-200 w-full max-w-[400px] max-h-[500px]"
            sizes="(max-width: 640px) 100vw, 400px"
            priority
          />
        )}
      </div>
    </div>
  );
}
