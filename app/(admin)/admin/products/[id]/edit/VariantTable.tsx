"use client";
import { useState } from "react";
import type { EditableVariant } from "./EditProductVariantsClient";


export default function VariantTable({ variants }: { variants: EditableVariant[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [variantList, setVariantList] = useState(variants);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use a dynamic import for the server action

  async function updateStockOnServer(variantId: string, newStock: number) {
    const { updateVariantStock } = await import("@/server/actions/admin-products");
    return updateVariantStock(variantId, newStock);
  }

  // Fetch latest variants from the server after update
  async function refetchVariants() {
    try {
      const res = await fetch(window.location.pathname + "/variants", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.variants)) {
        setVariantList(data.variants);
      }
    } catch {
      // Ignore fetch errors, fallback to local update
    }
  }

  const handleEdit = (variant: EditableVariant) => {
    setEditingId(variant.id);
    setStockValue(variant.stock);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setStockValue(null);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (variant: EditableVariant) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateStockOnServer(variant.id, stockValue ?? 0);
      await refetchVariants();
      setEditingId(null);
      setStockValue(null);
      setSuccess("Stock updated successfully.");
      // Log to console for debugging
      console.log(`Stock updated for variant ${variant.id} to ${stockValue}`);
    } catch (err) {
      setError("Failed to update stock. Please try again.");
      // Log error for debugging
      console.error("Stock update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      {error && <div className="p-2 text-sm text-red-600">{error}</div>}
      {success && <div className="p-2 text-sm text-green-600">{success}</div>}
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-4 py-3">Colour</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {variantList.map((variant) => (
            <tr key={variant.id} className="border-t border-zinc-100">
              <td className="px-4 py-3">{variant.color || "-"}</td>
              <td className="px-4 py-3">{variant.size || "-"}</td>
              <td className="px-4 py-3">
                {editingId === variant.id ? (
                  <input
                    type="number"
                    className="w-20 rounded border px-2 py-1 text-sm"
                    value={stockValue ?? 0}
                    min={0}
                    onChange={(e) => setStockValue(Number(e.target.value))}
                    disabled={loading}
                  />
                ) : (
                  variant.stock
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === variant.id ? (
                  <>
                    <button
                      className="mr-2 rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                      onClick={() => handleSave(variant)}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      className="rounded bg-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-400"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                    onClick={() => handleEdit(variant)}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
