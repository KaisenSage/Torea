export default function SearchPage() {
  return (
    <div className="space-y-4 pb-16">
      <h1 className="text-3xl font-semibold text-zinc-900">Search</h1>
      <p className="text-sm text-zinc-600">Product search UI can be connected here in the next step.</p>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <input
          type="search"
          placeholder="Search dresses, sets, trousers..."
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
        />
      </div>
    </div>
  );
}
