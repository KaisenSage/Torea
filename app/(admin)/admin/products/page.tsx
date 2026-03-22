import Link from "next/link";
import { listAdminProducts } from "@/server/actions/admin-products";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Products</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Variants</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: { id: string; name: string; slug: string; variants: Array<unknown> }) => (
              <tr key={product.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <Link className="font-medium" href={`/admin/products/${product.id}/edit`}>
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{product.slug}</td>
                <td className="px-4 py-3 text-zinc-600">{product.variants.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
