import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";

import { Disclaimer } from "@/components/Disclaimer";
import { MobileNav } from "@/components/MobileNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

import "./globals.css";

const inter = Inter({
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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4 sm:max-w-2xl sm:px-6">
              <Link
                href="/"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                Sahayak
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <div className="flex flex-1 flex-col pb-28 md:pb-0">
            {children}
            <footer className="mt-auto px-4 py-4 sm:px-6">
              <div className="mx-auto w-full max-w-lg sm:max-w-2xl">
                <Disclaimer />
              </div>
            </footer>
          </div>

          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
