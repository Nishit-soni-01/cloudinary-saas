import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cloudinary Studio",
  description: "Your personal cloud media management platform.",
};

export const viewport: Viewport = {
  themeColor: "#080810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${hanken.variable} ${instrument.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}