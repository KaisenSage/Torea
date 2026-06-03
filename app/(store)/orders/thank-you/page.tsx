import { prisma } from "@/server/db/prisma";
import { setCartCookieMap } from "@/server/services/cart-cookie";
import { verifyPaystackTransaction } from "@/server/services/paystack";
import { fulfillPaidOrder } from "@/server/services/order-fulfillment";

type ThankYouPageProps = {
  searchParams: Promise<{ reference?: string }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const reference = params.reference;
  let orderSummary: React.ReactNode = null;
  let statusMessage = (
    <p className="mt-3 text-sm text-zinc-600">
      Payment confirmation is finalized by webhook. You will receive an order email once verified.
    </p>
  );

  if (reference) {
    let tx = await prisma.paymentTransaction.findUnique({
      where: { reference },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
      },
    });

    if (tx && tx.status !== "SUCCESS" && tx.order?.status === "PENDING_PAYMENT") {
      try {
        const verified = await verifyPaystackTransaction(reference);
        if (verified.status === "success") {
          await fulfillPaidOrder(reference, verified);
          tx = await prisma.paymentTransaction.findUnique({
            where: { reference },
            include: {
              order: {
                include: {
                  items: {
                    include: {
                      product: true,
                      variant: true,
                    },
                  },
                },
              },
            },
          });
        }
      } catch {
        // Webhook or a later retry can still finalize the order.
      }
    }

    const webhook = tx
      ? null
      : await prisma.webhookEvent.findFirst({
          where: {
            provider: "PAYSTACK",
            eventId: reference,
          },
          orderBy: { createdAt: "desc" },
        });

    const webhookPayload = webhook?.payload as
      | {
          data?: {
            amount?: number;
            customer?: {
              email?: string;
            };
          };
        }
      | undefined;

    if (tx) {
      if (tx.status === "SUCCESS" && tx.order?.status === "PAID") {
        await setCartCookieMap({});
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

      if (tx.order) {
        orderSummary = (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-left">
            <p className="text-sm font-semibold text-zinc-900">Order summary</p>
            <div className="mt-3 space-y-2 text-sm text-zinc-700">
              {tx.order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-900">{item.product.name}</p>
                    <p>
                      Qty {item.quantity}
                      {item.variant.color ? ` • ${item.variant.color}` : ""}
                      {item.variant.size ? ` • ${item.variant.size}` : ""}
                    </p>
                  </div>
                  <p>₦{(item.totalPriceKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
              <div className="border-t border-zinc-200 pt-3 font-medium text-zinc-900">
                Total: ₦{(tx.order.totalKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        );
      }
    } else if (webhook) {
      statusMessage = (
        <p className="mt-3 text-sm text-amber-700">
          We received a payment reference for this transaction, but there is no linked order yet. Reference <span className="font-semibold">{reference}</span>
          {webhookPayload?.data?.customer?.email ? ` was paid by ${webhookPayload.data.customer.email}` : ""}. Please contact support so we can recover it.
        </p>
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-10 text-center">
      <h1 className="text-3xl font-semibold text-zinc-900">Thank you for your order</h1>
      {statusMessage}
      {orderSummary}
      <a
        href="/shop"
        className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900"
      >
        Continue Shopping
      </a>
    </div>
  );
}
