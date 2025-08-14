import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AnonymousUserProvider } from "@/contexts/AnonymousUserContext";

export const metadata: Metadata = {
  title: "Blog Nội Trợ - Chia sẻ kinh nghiệm và bí quyết làm việc nhà",
  description:
    "Cộng đồng blog nội trợ chia sẻ những kinh nghiệm, mẹo hay trong nấu ăn, chăm sóc gia đình và cuộc sống hàng ngày.",
  keywords: "blog nội trợ, nấu ăn, gia đình, chăm sóc nhà cửa, mẹo hay",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased bg-gradient-to-br from-pink-50 to-orange-50 min-h-screen">
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <AnonymousUserProvider>{children}</AnonymousUserProvider>
      </body>
    </html>
  );
}
