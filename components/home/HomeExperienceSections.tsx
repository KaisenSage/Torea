"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const reviews = [
  {
    id: "rv1",
    name: "Amaka U.",
    city: "Lagos",
    quote: "The fit is clean, the fabric feels premium, and delivery was faster than expected.",
  },
  {
    id: "rv2",
    name: "Tobi A.",
    city: "Abuja",
    quote: "I wore TORÉA for an event and got compliments all night. Quality is top-tier.",
  },
  {
    id: "rv3",
    name: "Zainab M.",
    city: "Port Harcourt",
    quote: "Minimal design but bold presence. Exactly the look I wanted.",
  },
  {
    id: "rv4",
    name: "David E.",
    city: "Ibadan",
    quote: "The stitching and finishing are excellent. It looks even better in person.",
  },
  {
    id: "rv5",
    name: "Nkechi O.",
    city: "Enugu",
    quote: "I ordered two pieces and both fit perfectly. Definitely ordering again.",
  },
  {
    id: "rv6",
    name: "Femi R.",
    city: "Lagos",
    quote: "Clean cuts, premium feel, and the delivery updates were very smooth.",
  },
  {
    id: "rv7",
    name: "Aisha K.",
    city: "Kano",
    quote: "My new go-to brand for statement basics. Quality is very impressive.",
  },
  {
    id: "rv8",
    name: "Temi B.",
    city: "Abeokuta",
    quote: "Exactly the minimalist look I wanted, but still unique and expressive.",
  },
  {
    id: "rv9",
    name: "Ifeanyi C.",
    city: "Awka",
    quote: "The fabric breathes well in our weather and still keeps a structured shape.",
  },
  {
    id: "rv10",
    name: "Mariam S.",
    city: "Ilorin",
    quote: "Fast dispatch, premium packaging, and beautiful pieces. Loved everything.",
  },
  {
    id: "rv11",
    name: "Boma T.",
    city: "Port Harcourt",
    quote: "I have worn mine multiple times and it still looks fresh after washing.",
  },
];

export default function HomeExperienceSections() {
  const reviewsContainerRef = useRef<HTMLDivElement | null>(null);
  const [isReviewHovered, setIsReviewHovered] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isReviewHovered) {
        return;
      }

      const container = reviewsContainerRef.current;
      if (!container) {
        return;
      }

      const amount = Math.max(container.clientWidth * 0.85, 280);
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const isAtEnd = container.scrollLeft >= maxScrollLeft - 8;

      if (isAtEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      container.scrollBy({ left: amount, behavior: "smooth" });
    }, 3800);

    return () => {
      window.clearInterval(interval);
    };
  }, [isReviewHovered]);

  function scrollReviews(direction: "left" | "right") {
    const container = reviewsContainerRef.current;
    if (!container) {
      return;
    }

    const amount = Math.max(container.clientWidth * 0.85, 280);
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  async function submitNewsletter() {
    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    setSuccessMessage(null);
    setErrorMessage(null);

    if (!isValidEmail) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };

      if (!response.ok || !data.ok) {
        setErrorMessage(data.error || "Unable to subscribe right now.");
        return;
      }

      setSuccessMessage(data.message || "You are now subscribed.");
      setEmail("");
    } catch {
      setErrorMessage("Unable to subscribe right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-8 sm:px-8" aria-labelledby="reviews-title">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="reviews-title" className="text-2xl font-semibold tracking-tight text-zinc-900">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-2">
            <p className="hidden text-xs uppercase tracking-[0.22em] text-zinc-500 sm:block">Trusted by Our customers</p>
            <button
              type="button"
              onClick={() => scrollReviews("left")}
              aria-label="Scroll reviews left"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:border-zinc-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current">
                <path d="m15 18-6-6 6-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollReviews("right")}
              aria-label="Scroll reviews right"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:border-zinc-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current">
                <path d="m9 6 6 6-6 6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={reviewsContainerRef}
          onMouseEnter={() => setIsReviewHovered(true)}
          onMouseLeave={() => setIsReviewHovered(false)}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((review) => (
            <article
              key={review.id}
              className="min-w-[82%] snap-start rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:min-w-[48%] lg:min-w-[32%]"
            >
              <p className="text-sm leading-6 text-zinc-700">"{review.quote}"</p>
              <p className="mt-4 text-sm font-semibold text-zinc-900">{review.name}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{review.city}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="newsletter"
        className="overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-900 px-6 py-10 text-white sm:px-8"
        aria-labelledby="newsletter-title"
      >
        <div className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-300">Newsletter</p>
            <h2 id="newsletter-title" className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              Get first access to drops, restocks, and private sale alerts.
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full rounded-full border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={submitNewsletter}
                disabled={isSubmitting}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-60"
              >
                {isSubmitting ? "Subscribing..." : "Join"}
              </button>
            </div>
            {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
            {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
