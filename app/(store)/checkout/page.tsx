"use client";

// Luxe Set color-to-image mapping
const luxeSetImages: Record<string, string> = {
  "blue": "https://your.cloudflare.url/9dc956be-2fad-4f6c-c6a0-5096368e0200",
  "mint green": "https://your.cloudflare.url/2530091a-2f46-470c-a629-a6225d99ea00",
  "nude": "https://your.cloudflare.url/ef34d6ab-8cba-45ba-815c-f434b9479700",
  "light brown": "https://your.cloudflare.url/ee920c49-3e5c-40af-210b-fe916ef0a700"
};
// Elevate Jacket (short hand) color-to-image mapping
const elevateJacketShortHandImages: Record<string, string> = {
  "baby pink": "https://your.cloudflare.url/f9e5c3f0-091c-4f3a-203a-96be40c82000",
  "light blue": "https://your.cloudflare.url/b93f1dbf-b6b9-4454-5b51-9dc8aa6cde00",
  "grey": "https://your.cloudflare.url/701b8248-5424-4e7d-adda-134d80e09900",
  "nude": "https://your.cloudflare.url/0bb2a142-2a4e-4b75-2549-f5b668ffdb00",
  "black": "https://your.cloudflare.url/a6a9439e-38b5-49c2-0d45-c6b065770d00"
};

// Charme Set color-to-image mapping
const charmeSetImages: Record<string, string> = {
  grey: "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_0805.PNG",
  black: "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_0671.PNG",
  wine: "https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/cloth%20torea/IMG_0681.PNG",
};

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function CheckoutPage() {
  function formatNaira(priceKobo: number) {
    return `₦${(priceKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  }
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [missingPaystackVars, setMissingPaystackVars] = useState<string[]>([]);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [paystackReady, setPaystackReady] = useState<boolean | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("lag-mainland");
  const [saveInfo, setSaveInfo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("torea_checkout_save");
      setSaveInfo(saved === "true");
    }
  }, []);
  const [state, setState] = useState("Lagos");
  const [deliveryType, setDeliveryType] = useState<"ship" | "pickup">("ship");
  // Fix ReferenceError: discountCode is not defined
  const [discountCode, setDiscountCode] = useState("");

type CartItem = {
  key: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  priceKobo: number;
  imageUrl: string;
};

const lagosOptions = [
  { id: "lag-mainland", label: "Lagos Mainland", eta: "Takes 24-48 working hours", priceKobo: 300000 },
  { id: "lag-island", label: "Lagos Island", eta: "Takes 24-48 working hours", priceKobo: 350000 },
  { id: "lag-outskirts", label: "Lagos Outskirts", eta: "Takes 48-72 working hours", priceKobo: 500000 },
];
// regionalOptions removed
const states = [
  "Lagos",
  "Abuja (FCT)",
  "Oyo",
  "Rivers",
  "Kano",
  "Enugu",
  "Delta",
  "Kaduna",
  "Ogun",
  "Anambra",
];

  const shippingOptions = useMemo(() => {
    const lagosOptions = [
      { id: "lag-mainland", label: "Lagos Mainland", eta: "Takes 24-48 working hours", priceKobo: 300000 },
      { id: "lag-island", label: "Lagos Island", eta: "Takes 24-48 working hours", priceKobo: 350000 },
      { id: "lag-outskirts", label: "Lagos Outskirts", eta: "Takes 48-72 working hours", priceKobo: 500000 },
    ];
    return lagosOptions;
  }, [state]);
  const displayedShippingOptions =
    deliveryType === "pickup"
      ? [{ id: "pickup", label: "Store Pickup", eta: "Ready in 24 working hours", priceKobo: 0 }]
      : lagosOptions;
  // ...existing code...
  useEffect(() => {
    let mounted = true;
    async function loadCart() {
      setIsLoadingItems(true);
      try {
        const response = await fetch("/api/cart");
        const data = (await response.json()) as { items: CartItem[] };
        if (mounted) {
          setItems(data.items || []);
        }
      } finally {
        if (mounted) {
          setIsLoadingItems(false);
        }
      }
    }
    void loadCart();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedShippingId = displayedShippingOptions.some((option) => option.id === selectedShipping)
    ? selectedShipping
    : (displayedShippingOptions[0]?.id || "");

  const subtotalKobo = items.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0);
  const selectedShippingOption = displayedShippingOptions.find((option) => option.id === selectedShippingId);
  const shippingFeeKobo = deliveryType === "pickup" ? 0 : (selectedShippingOption?.priceKobo || 0);
    // Fix ReferenceError: discountApplied is not defined
    const discountApplied = !!discountCode;
  const discountKobo = discountApplied ? Math.round(subtotalKobo * 0.05) : 0;
  const totalKobo = subtotalKobo + shippingFeeKobo - discountKobo;
  const taxKobo = Math.round(totalKobo * 0.075);

  async function handleContinueToPaystack() {
    setCheckoutError(null);

    if (paystackReady === false) {
      setCheckoutError("Paystack is not configured. Add missing environment variables and restart the app.");
      return;
    }

    if (items.length === 0) {
      setCheckoutError("Your cart is empty. Add at least one item before checkout.");
      return;
    }

    const requiresShippingAddress = deliveryType === "ship";

    if (
      !emailOrPhone ||
      (requiresShippingAddress && (!firstName || !lastName || !addressLine1 || !city))
    ) {
      setCheckoutError("Please complete required contact and shipping fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/checkout/paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryType,
          contact: {
            emailOrPhone,
          },
          shipping: {
            firstName: firstName || "Pickup",
            lastName: lastName || "Customer",
            line1: addressLine1 || "TORÉA Studio Pickup",
            line2: addressLine2,
            city: city || "Lagos",
            state,
            phone: phone || emailOrPhone,
          },
          totals: {
            totalKobo,
          },
        }),
      });

      const data = (await response.json()) as { authorizationUrl?: string; error?: string };

      if (!response.ok || !data.authorizationUrl) {
        setCheckoutError(data.error || "Unable to initialize payment at the moment.");
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch {
      setCheckoutError("Something went wrong while connecting to Paystack.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 pb-16">
      {paystackReady === false ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Paystack is not configured for this environment.</p>
          <p className="mt-1">Missing: {missingPaystackVars.join(", ")}</p>
          <p className="mt-1">Add these values in .env.local and restart the dev server.</p>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <p className="font-display text-2xl tracking-[0.1em] text-zinc-900">TORÉA</p>
        <Link href="/cart" aria-label="Return to cart" className="rounded-full border border-zinc-300 p-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-black/80">
            <path d="M6 8h12l-1 13H7L6 8Z" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 8a3 3 0 0 1 6 0" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="space-y-3 border-b border-zinc-200 pb-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Contact</h2>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-700">Email or mobile phone number</span>
              <input
                className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300"
              />
              Email me with news and offers
            </label>
          </div>

          <div className="space-y-4 border-b border-zinc-200 pb-5">
            <h2 className="text-lg font-semibold text-zinc-900">Delivery</h2>
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
              <button
                type="button"
                onClick={() => setDeliveryType("ship")}
                className={`rounded-md px-4 py-2 text-sm ${deliveryType === "ship" ? "bg-white text-zinc-900" : "text-zinc-600"}`}
              >
                Ship
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("pickup")}
                className={`rounded-md px-4 py-2 text-sm ${deliveryType === "pickup" ? "bg-white text-zinc-900" : "text-zinc-600"}`}
              >
                Pickup
              </button>
            </div>

            {deliveryType === "ship" ? (
              <div className="space-y-3">
                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-700">Country/Region</span>
                  <select className="w-full rounded-lg border border-zinc-200 px-3 py-2" defaultValue="Nigeria">
                    <option>Nigeria</option>
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block text-zinc-700">First name</span>
                    <input
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block text-zinc-700">Last name</span>
                    <input
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-700">Address</span>
                  <input
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-700">Apartment, suite, etc. (optional)</span>
                  <input
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-sm sm:col-span-1">
                    <span className="mb-1 block text-zinc-700">City</span>
                    <input
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </label>
                  <label className="block text-sm sm:col-span-1">
                    <span className="mb-1 block text-zinc-700">State</span>
                    <select
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      {states.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm sm:col-span-1">
                    <span className="mb-1 block text-zinc-700">Postal code (optional)</span>
                    <input className="w-full rounded-lg border border-zinc-200 px-3 py-2" type="text" />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-700">Phone</span>
                  <input
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Save this information for next time
                </label>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
                Pickup is enabled. Pickup location: TORÉA Studio, Lekki, Lagos.
              </div>
            )}
          </div>

          <div className="space-y-4 border-b border-zinc-200 pb-5">
            <h2 className="text-lg font-semibold text-zinc-900">Shipping method</h2>
            <div className="space-y-2">
              {displayedShippingOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 p-3 text-sm"
                >
                  <div className="flex gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShippingId === option.id}
                      onChange={() => setSelectedShipping(option.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <p className="font-medium text-zinc-900">{option.label}</p>
                      <p className="text-zinc-600">{option.eta}</p>
                    </div>
                  </div>
                  <p className="font-medium text-zinc-900">{formatNaira(option.priceKobo)}</p>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Payment</h2>
              <p className="text-sm text-zinc-600">All transactions are secure and encrypted.</p>
            </div>

            <label className="flex items-start justify-between rounded-xl border border-zinc-200 p-3 text-sm">
              <div className="flex gap-2">
                <input type="radio" name="payment" defaultChecked className="mt-1 h-4 w-4" />
                <div>
                  <p className="font-medium text-zinc-900">Paystack</p>
                  <p className="text-zinc-600">You will be redirected to Paystack to complete your purchase.</p>
                </div>
              </div>
              <div className="text-xs text-zinc-500">Visa  Mastercard  Verve</div>
            </label>

            <label className="flex items-start justify-between rounded-xl border border-zinc-200 p-3 text-sm opacity-60">
              <div className="flex gap-2">
                <input type="radio" name="payment" disabled className="mt-1 h-4 w-4" />
                <div>
                  <p className="font-medium text-zinc-900">Flutterwave</p>
                  <p className="text-zinc-600">Coming soon</p>
                </div>
              </div>
            </label>

            {checkoutError ? <p className="text-sm text-red-600">{checkoutError}</p> : null}

            <button
              type="button"
              onClick={handleContinueToPaystack}
              disabled={isSubmitting || paystackReady === false}
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? "Connecting to Paystack..." : paystackReady === false ? "Paystack unavailable" : "Continue to Paystack"}
            </button>
          </div>
        </section>

        <aside className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Order summary</h2>

          <div className="space-y-3">
            {isLoadingItems ? <p className="text-sm text-zinc-600">Loading order summary...</p> : null}
            {!isLoadingItems && items.length === 0 ? (
              <p className="text-sm text-zinc-600">Your cart is empty.</p>
            ) : null}
            {items.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-14 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                    <Image
                      src={item.imageUrl || "/placeholder.png"}
                      alt={item.name + (item.color ? ` (${item.color})` : "")}
                      width={56}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                    <p className="text-xs text-zinc-600">Size {item.size} • Color {item.color}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-zinc-900">{formatNaira(item.priceKobo * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Discount code or gift card"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              // Use setDiscountCode to update discount code
              onClick={() => setDiscountCode(discountCode.trim())}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-700">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatNaira(subtotalKobo)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatNaira(shippingFeeKobo)}</span>
            </div>
            {discountApplied ? (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Discount</span>
                <span>-{formatNaira(discountKobo)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
              <span>Total (NGN)</span>
              <span>{formatNaira(totalKobo)}</span>
            </div>
            <p className="text-xs text-zinc-500">Including {formatNaira(taxKobo)} in taxes.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

