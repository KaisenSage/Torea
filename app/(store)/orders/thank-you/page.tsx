export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-10 text-center">
      <h1 className="text-3xl font-semibold text-zinc-900">Thank you for your order</h1>
      <p className="mt-3 text-sm text-zinc-600">
        Payment confirmation is finalized by webhook. You will receive an order email once verified.
      </p>
      <a
        href="/shop"
        className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900"
      >
        Continue Shopping
      </a>
    </div>
  );
}
