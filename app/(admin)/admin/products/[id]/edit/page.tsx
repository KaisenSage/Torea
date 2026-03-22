type EditProductPageProps = {
  params: Promise<{ id: string }>;
};


import { prisma } from "@/server/db/prisma";

import EditProductVariantsClient from "./EditProductVariantsClient";

export default async function EditAdminProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  // Fetch product and its variants
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!product) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Product not found</h1>
      </div>
    );
  }

  // Inline editing state (client component)
  // This must be a client component for interactivity
  // So, split the table into a VariantTable client component

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Edit Product</h1>
      <p className="text-sm text-zinc-600">Product ID: {id}</p>
      <h2 className="text-lg font-semibold mt-6">Variants</h2>
      <EditProductVariantsClient variants={product.variants} />
    </div>
  );
}

