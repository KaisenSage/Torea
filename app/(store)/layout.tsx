import { StoreFooter } from "@/components/layout/StoreFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <StoreFooter />
    </>
  );
}
