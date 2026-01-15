import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UBA USSD Portal - Admin Dashboard",
  description: "Management portal for UBA USSD Menu system",
};
import { MockModeBanner } from "@/components/ui/MockModeBanner";
import { getMockMode } from "@/lib/mocks/config";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window !== "undefined" && getMockMode() !== "off") {
    // eslint-disable-next-line no-console
    console.warn(`MOCK MODE ACTIVE: All API calls are using mock data. Mode: ${getMockMode()}`);
  }
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
          <MockModeBanner />
        </QueryProvider>
      </body>
    </html>
  );
}
