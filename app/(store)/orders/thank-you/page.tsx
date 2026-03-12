import { prisma } from "@/server/db/prisma";

type ThankYouPageProps = {
  searchParams: { reference?: string };
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const reference = searchParams.reference;
  let statusMessage = (
    <p className="mt-3 text-sm text-zinc-600">
      Payment confirmation is finalized by webhook. You will receive an order email once verified.
    </p>
  );

  if (reference) {
    const tx = await prisma.paymentTransaction.findUnique({
      where: { reference },
      include: { order: true },
    });

    if (tx) {
      if (tx.status === "SUCCESS" && tx.order?.status === "PAID") {
        statusMessage = (
          <p className="mt-3 text-sm text-zinc-600">
            <strong>Payment confirmed.</strong> Your order <span className="font-semibold">{tx.order.orderNumber}</span> has been paid and is being processed. You will also receive a confirmation email shortly.
          </p>
        );
      } else if (tx.status === "FAILED") {
        statusMessage = (
          <p className="mt-3 text-sm text-red-600">
            Unfortunately, your payment was not successful. Please try again or contact support.
          </p>
        );
      } else {
        statusMessage = (
          <p className="mt-3 text-sm text-zinc-600">
            Your payment is being verified. You will receive an email once it&apos;s confirmed.
          </p>
        );
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-10 text-center">
      <h1 className="text-3xl font-semibold text-zinc-900">Thank you for your order</h1>
      {statusMessage}
      <a
        href="/shop"
        className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900"
      >
        Continue Shopping
      </a>
    </div>
  );
}
