type CartSummaryProps = {
  subtotalKobo: number;
  shippingFeeKobo: number;
};

export function CartSummary({ subtotalKobo, shippingFeeKobo }: CartSummaryProps) {
  const totalKobo = subtotalKobo + shippingFeeKobo;

  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-zinc-500">Order Summary</h3>
      <dl className="space-y-2 text-sm text-zinc-700">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>₦{(subtotalKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>₦{(shippingFeeKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</dd>
        </div>
        <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 font-semibold text-zinc-900">
          <dt>Total</dt>
          <dd>₦{(totalKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</dd>
        </div>
      </dl>
    </aside>
  );
}
