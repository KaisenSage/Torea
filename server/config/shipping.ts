export type DeliveryType = "ship" | "pickup";

export type ShippingOptionId =
  | "lag-mainland"
  | "lag-island"
  | "lag-outskirts"
  | "pickup";

export const LAGOS_SHIPPING_OPTIONS = [
  { id: "lag-mainland" as const, label: "Lagos Mainland", priceKobo: 300_000 },
  { id: "lag-island" as const, label: "Lagos Island", priceKobo: 350_000 },
  { id: "lag-outskirts" as const, label: "Lagos Outskirts", priceKobo: 500_000 },
];

export function resolveShippingFeeKobo(input: {
  deliveryType: DeliveryType;
  shippingOptionId?: string;
  state?: string;
}) {
  if (input.deliveryType === "pickup") {
    return 0;
  }

  const option = LAGOS_SHIPPING_OPTIONS.find(
    (entry) => entry.id === input.shippingOptionId,
  );

  if (option) {
    return option.priceKobo;
  }

  // Fallback for legacy requests without a shipping option id.
  return input.state?.trim().toLowerCase() === "lagos" ? 300_000 : 500_000;
}
