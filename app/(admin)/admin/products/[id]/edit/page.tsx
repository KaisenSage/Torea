type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Edit Product</h1>
      <p className="text-sm text-zinc-600">Product ID: {id}</p>
    </div>
  );
}
