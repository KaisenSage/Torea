import { listAdminOrders } from "@/server/actions/admin-orders";

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3">
                  ₦{(order.totalKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
