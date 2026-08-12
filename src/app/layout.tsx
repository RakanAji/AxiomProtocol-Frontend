import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";

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
    <html lang="en" className="dark" style={{ backgroundColor: "#000000" }}>
      <body
        className="font-sans min-h-screen"
        style={{
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)",
        }}
      >
        <Providers>
          <FloatingOrbs />
          <Navigation />
          <LeftSidebar />
          <RightSidebar />
          <main className="pt-20 xl:pl-60 xl:pr-72 relative z-10 transition-all">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
