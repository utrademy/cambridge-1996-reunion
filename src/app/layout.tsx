import type { Metadata } from "next";
import {
  Caveat,
  Oswald,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Promoción 1996 — New Cambridge School | 30 Years Reunion",
    template: "%s | Promoción 1996 — New Cambridge School",
  },
  description:
    "30 años después, la historia nos vuelve a reunir. Distintos caminos. Los mismos recuerdos. Una generación para siempre. Sábado, 19 de diciembre de 2026.",
  openGraph: {
    title: "Class of 1996 — 30 Years Reunion | New Cambridge School",
    description:
      "30 años después, la historia nos vuelve a reunir. Sábado 19 de diciembre de 2026 · New Cambridge School, Floridablanca.",
    type: "website",
    locale: "es_CO",
    siteName: "Promoción 1996 — New Cambridge School",
  },
  twitter: {
    card: "summary_large_image",
    title: "Class of 1996 — 30 Years Reunion | New Cambridge School",
    description:
      "Distintos caminos. Los mismos recuerdos. Una generación para siempre. Sábado 19 de diciembre de 2026.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${jakarta.variable} ${playfair.variable} ${caveat.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F6F2E9] text-[#111827]">
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-[#142B53] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#F6F2E9] focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
