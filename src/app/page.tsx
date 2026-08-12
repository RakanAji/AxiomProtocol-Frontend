"use client";

import Link from "next/link";
import { useReadContracts } from "wagmi";
import {
  Shield,
  FileSignature,
  CheckCircle,
  ArrowRight,
  Lock,
  Globe,
  Database,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
  IS_AXIOM_ROUTER_CONFIGURED,
  ROUTER_CONFIGURATION_ERROR,
} from "@/lib/contracts/axiom-router";
import { formatEther } from "viem";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

const protocolTip =
  "💡 Registration proves that a wallet anchored a fingerprint at a given time; always evaluate authorship and metadata separately.";

const contractConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;

export default function HomePage() {
  const { data, error, isLoading } = useReadContracts({
    contracts: [
      { ...contractConfig, functionName: "getTotalRecords" },
      { ...contractConfig, functionName: "getTotalFeesCollected" },
    ],
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED,
      refetchInterval: 30000,
    },
  });

  const totalRecords = data?.[0]?.result as bigint | undefined;
  const totalFees = data?.[1]?.result as bigint | undefined;

  const formatETH = (wei: bigint | undefined) => {
    if (wei === undefined) return "0";
    const eth = formatEther(wei);
    return parseFloat(eth).toFixed(4);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Tip Banner */}
      <div className="bg-gradient-to-r from-axiom-cyan/10 via-axiom-purple/10 to-axiom-pink/10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <p className="text-sm text-center text-white/70">
            <Sparkles className="w-4 h-4 inline-block mr-2 text-amber-400" />
            {protocolTip}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-axiom-cyan/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-axiom-purple/20 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-axiom-green animate-pulse" />
            <span className="text-sm text-white/70">Sepolia test deployment</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-white">Verify </span>
            <span className="text-gradient">Registration</span>
            <br />
            <span className="text-white/60">On-Chain</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Axiom Protocol anchors a content fingerprint to a wallet and time,
            then lets anyone inspect the record&apos;s current on-chain status.
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

      {/* Live Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {!IS_AXIOM_ROUTER_CONFIGURED && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
              {ROUTER_CONFIGURATION_ERROR}
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
              Protocol metrics unavailable: {error.message.slice(0, 160)}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Database className="w-5 h-5 text-axiom-cyan" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {isLoading ? "…" : totalRecords?.toString() || "0"}
              </div>
              <div className="text-sm text-white/50">Total Records</div>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-axiom-purple" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {isLoading ? "…" : `${formatETH(totalFees)} ETH`}
              </div>
              <div className="text-sm text-white/50">Registration Fees Collected</div>
            </div>
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
            Three steps to create and independently inspect an on-chain
            registration record.
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
                The fingerprint is written to the configured contract with
                your wallet address, timestamp, and optional metadata.
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
                Anyone can recompute the fingerprint and inspect the matching
                record and its current status on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Stats Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-gradient mb-2">
                SHA-256
              </div>
              <div className="text-sm text-white/50">Local file hashing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient mb-2">
                On-chain
              </div>
              <div className="text-sm text-white/50">Current record state</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient mb-2">
                Wallet
              </div>
              <div className="text-sm text-white/50">Signed state changes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/leaderboard"
              className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-axiom-cyan/30 transition-all text-center group"
            >
              <span className="text-2xl">🏆</span>
              <p className="text-sm text-white/70 mt-2 group-hover:text-white transition-colors">
                Leaderboard
              </p>
            </Link>
            <Link
              href="/changelog"
              className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-axiom-purple/30 transition-all text-center group"
            >
              <span className="text-2xl">📋</span>
              <p className="text-sm text-white/70 mt-2 group-hover:text-white transition-colors">
                Usage Guide
              </p>
            </Link>
            <Link
              href="/stats"
              className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-axiom-green/30 transition-all text-center group"
            >
              <span className="text-2xl">📊</span>
              <p className="text-sm text-white/70 mt-2 group-hover:text-white transition-colors">
                Network Stats
              </p>
            </Link>
            <Link
              href="/identity"
              className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-axiom-pink/30 transition-all text-center group"
            >
              <span className="text-2xl">🔐</span>
              <p className="text-sm text-white/70 mt-2 group-hover:text-white transition-colors">
                Get Identity
              </p>
            </Link>
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
