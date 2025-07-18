import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { voncaFont } from "@/lib/fonts";
import "./globals.css";
import SessionProviders from "./SessionProviders";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sherlocked",
  description: "Cryptic Hunt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${voncaFont.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviders>
          {children}
          <Toaster />
        </SessionProviders>
      </body>
    </html>
  );
}
