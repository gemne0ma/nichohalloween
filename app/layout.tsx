import type { Metadata } from "next";
import {
  IM_Fell_English_SC,
  Cormorant_Garamond,
  Special_Elite,
} from "next/font/google";
import "./globals.css";

// Display headings. The 17th-century letterpress look.
const imFellEnglishSC = IM_Fell_English_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-im-fell-english-sc",
  display: "swap",
});

// Body text. Elegant, readable, warm.
const cormorantGaramond = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

// Typewriter ephemera. Eyebrows, metadata, ticket numbers.
const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
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
      className={`${imFellEnglishSC.variable} ${cormorantGaramond.variable} ${specialElite.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
