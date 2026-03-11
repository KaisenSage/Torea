import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { GFS_Didot } from "next/font/google";
import { Header } from "@/components/header/Header";
import { InstagramContactButton } from "@/components/ui/InstagramContactButton";
import "./globals.css";

const didotSans = GFS_Didot({
  variable: "--font-inter",
  weight: "400",
  subsets: ["greek", "latin"],
});

const didotDisplay = GFS_Didot({
  variable: "--font-display",
  weight: "400",
  subsets: ["greek", "latin"],
});

export const metadata: Metadata = {
  title: "TOREA Fashion",
  description: "Nigeria-first fashion storefront with secure Paystack checkout",
  appleMobileWebAppTitle: "TORÉA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${didotSans.variable} ${didotDisplay.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ClerkProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <InstagramContactButton />
            <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">{children}</main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
