import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/server/auth/rbac";
import { prisma } from "@/server/db/prisma";

function formatNaira(priceKobo: number) {
  return `₦${(priceKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AccountOrdersPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/account/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
      payment: {
        select: {
          status: true,
          reference: true,
        },
      },
    },
  });

  return (
    <div className="space-y-4 pb-16">
      <h1 className="text-3xl font-semibold text-zinc-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 p-5 text-sm text-zinc-700">
          No orders yet. Once you complete checkout, your order timeline appears here.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {new Date(order.createdAt).toLocaleString("en-NG")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-900">{formatStatus(order.status)}</p>
                  <p className="mt-1 text-sm text-zinc-600">{formatNaira(order.totalKobo)}</p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name} × {item.quantity}
                  </li>
                ))}
              </ul>

              {order.payment?.reference ? (
                <p className="mt-4 text-xs text-zinc-500">
                  Payment ref: {order.payment.reference}
                </p>
              ) : null}

              {order.status === "PAID" ? (
                <Link
                  href={`/orders/thank-you?reference=${order.payment?.reference || ""}`}
                  className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
                >
                  View receipt
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
