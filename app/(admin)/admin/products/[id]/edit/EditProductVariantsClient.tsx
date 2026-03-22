"use client";
import VariantTable from "./VariantTable";

export default function EditProductVariantsClient({ variants }: { variants: any[] }) {
  return <VariantTable variants={variants} />;
}
