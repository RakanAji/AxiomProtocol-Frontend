import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Axiom Protocol | Content Authenticity Verification",
  description:
    "Decentralized content authenticity verification. Register and verify digital content on the blockchain.",
  keywords: [
    "blockchain",
    "verification",
    "authenticity",
    "web3",
    "decentralized",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-animated-gradient bg-grid noise-overlay min-h-screen`}
      >
        <Providers>
          <Navigation />
          <main className="pt-20">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
