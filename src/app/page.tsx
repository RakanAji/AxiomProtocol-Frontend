import Link from "next/link";
import {
  Shield,
  FileSignature,
  CheckCircle,
  ArrowRight,
  Lock,
  Globe,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-axiom-cyan/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-axiom-purple/20 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-axiom-green animate-pulse" />
            <span className="text-sm text-white/70">Powered by Blockchain</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-white">Verify </span>
            <span className="text-gradient">Truth</span>
            <br />
            <span className="text-white/60">On-Chain</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Axiom Protocol enables decentralized content authenticity
            verification. Register your digital content and prove its
            authenticity to anyone, anywhere.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="xl" className="gap-2 group">
                <FileSignature className="w-5 h-5" />
                Register Content
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button size="xl" variant="outline" className="gap-2">
                <CheckCircle className="w-5 h-5" />
                Verify Content
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            How It Works
          </h2>
          <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
            Three simple steps to ensure your content is authenticated and
            verifiable forever.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-axiom-cyan/30 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-axiom-cyan/20 flex items-center justify-center mb-4 group-hover:shadow-glow-cyan transition-shadow">
                <Lock className="w-7 h-7 text-axiom-cyan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                1. Hash Locally
              </h3>
              <p className="text-white/60">
                Your file is hashed directly in your browser using SHA-256. The
                original content never leaves your device.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-axiom-purple/30 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-axiom-purple/20 flex items-center justify-center mb-4 group-hover:shadow-glow-purple transition-shadow">
                <Shield className="w-7 h-7 text-axiom-purple" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                2. Register On-Chain
              </h3>
              <p className="text-white/60">
                The hash is permanently recorded on the blockchain, linked to
                your wallet address and optional metadata.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-axiom-green/30 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-axiom-green/20 flex items-center justify-center mb-4 group-hover:shadow-glow-green transition-shadow">
                <Globe className="w-7 h-7 text-axiom-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                3. Verify Anywhere
              </h3>
              <p className="text-white/60">
                Anyone can verify the content authenticity by simply dropping
                the file and checking against the blockchain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">100%</div>
              <div className="text-sm text-white/50">
                Client-Side Processing
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">∞</div>
              <div className="text-sm text-white/50">Immutable Records</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">
                <Zap className="w-8 h-8 mx-auto text-axiom-cyan" />
              </div>
              <div className="text-sm text-white/50">Instant Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center text-white/40 text-sm">
          Built with ❤️ on Ethereum | Axiom Protocol © 2026
        </div>
      </footer>
    </div>
  );
}
