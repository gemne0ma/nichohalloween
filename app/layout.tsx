import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import "./globals.css";

// Display headings. Bold slab serif with presence.
const trenchSlab = localFont({
  src: "../public/TrenchSlab_Complete/Fonts/WEB/fonts/TrenchSlab-Variable.woff2",
  variable: "--font-trench-slab",
  display: "swap",
});

// Body, subheads, metadata. Clean geometric sans.
const alpino = localFont({
  src: "../public/Alpino_Complete/Fonts/WEB/fonts/Alpino-Variable.woff2",
  variable: "--font-alpino",
  display: "swap",
});

// Tagline / accent serif.
const telma = localFont({
  src: "../public/Telma_Complete/Fonts/WEB/fonts/Telma-Variable.woff2",
  variable: "--font-telma",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nicho Halloween Festival",
  description:
    "The 37th year of the Nicho Halloween Festival. Saturday 24 October 2026, 3 to 7pm. Nicholson Street Public School, Balmain East.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${trenchSlab.variable} ${alpino.variable} ${telma.variable}`}
    >
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
