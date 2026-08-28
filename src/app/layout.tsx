import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { AppShell } from "@/components/AppShell";
import { SkipToContent } from "@/components/SkipToContent";
import { ThemeProvider } from "@/components/ThemeProvider";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sahayak — GeM Seller Co-Pilot",
    template: "%s | Sahayak",
  },
  description:
    "Find the right government tenders, understand requirements, and prepare your bid on GeM.",
  applicationName: "Sahayak",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1E3A5F" },
    { media: "(prefers-color-scheme: dark)", color: "#0f2744" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full w-full flex-col font-sans">
        <SkipToContent />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
