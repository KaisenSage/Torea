import { listAdminOrders, lookupAdminOrder } from "@/server/actions/admin-orders";
import { OrderStatus } from "@prisma/client";

type AdminOrdersPageProps = {
  searchParams?: {
    q?: string;
  };
};

function formatNaira(amountKobo: number) {
  return `₦${(amountKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const orders = await listAdminOrders();
  const lookupQuery = searchParams?.q?.trim() || "";
  const lookup = lookupQuery ? await lookupAdminOrder(lookupQuery) : null;
  const webhookPayload = lookup?.webhook?.payload as
    | {
        data?: {
          amount?: number;
          customer?: {
            email?: string;
          };
        };
      }
    | undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <form className="flex flex-col gap-3 sm:flex-row" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={lookupQuery}
            placeholder="Search by Paystack reference, order number, phone, or email"
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white" type="submit">
            Lookup
          </button>
        </form>
        {lookupQuery ? (
          <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-700">
            {lookup?.order || lookup?.payment || lookup?.webhook ? (
              <div className="space-y-4">
                {lookup?.order ? (
                  <div className="space-y-2">
                    <p className="font-medium text-zinc-900">Order found: {lookup.order.orderNumber}</p>
                    <p>Customer: {lookup.order.shippingFullName} ({lookup.order.shippingPhone})</p>
                    <p>Email: {lookup.order.user.email}</p>
                    <p>Status: {lookup.order.status}</p>
                    <p>Total: {formatNaira(lookup.order.totalKobo)}</p>
                    <div>
                      {lookup.order.items.map((item) => (
                        <p key={item.id}>
                          {item.quantity} x {item.product.name} {item.variant.color ? `(${item.variant.color}` : ""}
                          {item.variant.size ? `${item.variant.color ? ", " : "("}${item.variant.size}` : ""}
                          {item.variant.color || item.variant.size ? ")" : ""} - {formatNaira(item.totalPriceKobo)}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!lookup?.order && lookup?.payment ? (
                  <div className="space-y-2">
                    <p className="font-medium text-zinc-900">Payment found without linked order details</p>
                    <p>Reference: {lookup.payment.reference}</p>
                    <p>Status: {lookup.payment.status}</p>
                    <p>Amount: {formatNaira(lookup.payment.amountKobo)}</p>
                    <p>Order linked: {lookup.payment.order ? lookup.payment.order.orderNumber : "No"}</p>
                  </div>
                ) : null}

                {!lookup?.order && !lookup?.payment && lookup?.webhook ? (
                  <div className="space-y-2">
                    <p className="font-medium text-zinc-900">Webhook-only payment record found</p>
                    <p>Reference: {lookup.webhook.eventId}</p>
                    <p>Customer email: {webhookPayload?.data?.customer?.email || "-"}</p>
                    <p>
                      Amount:{" "}
                      {typeof webhookPayload?.data?.amount === "number"
                        ? formatNaira(webhookPayload.data.amount)
                        : "-"}
                    </p>
                    <p className="text-zinc-500">This usually means Paystack captured money before the app created a local order.</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p>No matching order, payment, or webhook record was found.</p>
            )}
          </div>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Customer Email</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.payment?.reference || "-"}</td>
                <td className="px-4 py-3">{order.shippingFullName}</td>
                <td className="px-4 py-3">{order.user?.email || "-"}</td>
                <td className="px-4 py-3">{formatNaira(order.totalKobo)}</td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3">{order.status === OrderStatus.PENDING_PAYMENT ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
