import Link from "next/link";
import { requireAdmin } from "@/server/auth/rbac";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r border-zinc-200 bg-white p-6">
        <p className="mb-6 text-sm font-semibold tracking-wide text-zinc-500">Admin</p>
        <nav className="space-y-3 text-sm">
          <Link className="block" href="/admin">
            Dashboard
          </Link>
          <Link className="block" href="/admin/products">
            Products
          </Link>
          <Link className="block" href="/admin/orders">
            Orders
          </Link>
          <Link className="block" href="/admin/collections">
            Collections
          </Link>
          <Link className="block" href="/admin/discounts">
            Discounts
          </Link>
        </nav>
      </aside>

      <main className="bg-zinc-50 p-6">{children}</main>
    </div>
  );
}
