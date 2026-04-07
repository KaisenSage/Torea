"use client";
import VariantTable from "./VariantTable";

export type EditableVariant = {
  id: string;
  color: string | null;
  size: string | null;
  stock: number;
};

export default function EditProductVariantsClient({ variants }: { variants: EditableVariant[] }) {
  return <VariantTable variants={variants} />;
}
