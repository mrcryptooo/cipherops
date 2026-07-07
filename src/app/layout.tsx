import type { Metadata } from "next";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "@/components/Providers";
import { ProductTour } from "@/components/layout/ProductTour";

export const metadata: Metadata = {
  title: "CipherOps Registry — Every confidential token. One place.",
  description:
    "Discover every official ERC-20 ↔ ERC-7984 confidential wrapper pair, wrap assets, and privately reveal encrypted balances using Zama's confidential token infrastructure.",
  keywords: ["Zama", "fhEVM", "ERC-7984", "confidential tokens", "privacy", "Ethereum"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-zinc-200 antialiased">
        <Providers>{children}</Providers>
        <ProductTour />
      </body>
    </html>
  );
}
