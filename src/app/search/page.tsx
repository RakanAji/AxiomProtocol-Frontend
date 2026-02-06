"use client";

import { useState } from "react";
import Link from "next/link";
import { useReadContract } from "wagmi";
import {
  Search,
  Loader2,
  User,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { useIdentity } from "@/hooks/use-axiom";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Resolve name to address
  const {
    data: resolvedAddress,
    isLoading: isResolvingName,
    error: nameError,
  } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "resolveByName",
    args: submittedQuery ? [submittedQuery] : undefined,
    query: { enabled: !!submittedQuery },
  });

  // Fetch identity for resolved address
  const { identity, isLoadingIdentity } = useIdentity({
    address: resolvedAddress as `0x${string}` | undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
    }
  };

  // Check if address is zero (not found)
  const isZeroAddress =
    resolvedAddress === "0x0000000000000000000000000000000000000000";
  const hasResult =
    submittedQuery && !isResolvingName && resolvedAddress && !isZeroAddress;
  const notFound = submittedQuery && !isResolvingName && isZeroAddress;

  // Check if identity exists
  const hasIdentity = identity && Number(identity.registeredAt) > 0;

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white">Search Identity</h1>
          <p className="text-white/60">
            Find users by their registered name on Axiom Protocol
          </p>
        </div>

        {/* Search Box */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Name Lookup
            </CardTitle>
            <CardDescription>
              Enter a registered identity name to find their profile
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter name (e.g., Rakan, Alice, CryptoArtist)"
                className="flex-1 bg-white/5 border-white/10 focus:border-cyan-500/50 text-lg py-6"
              />
              <Button
                type="submit"
                size="lg"
                disabled={!searchQuery.trim() || isResolvingName}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 px-8"
              >
                {isResolvingName ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {(isResolvingName || isLoadingIdentity) && submittedQuery && (
          <div className="flex justify-center p-10">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        )}

        {/* Not Found */}
        {notFound && (
          <Card className="border-amber-500/30 bg-amber-950/30 backdrop-blur-xl p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  No identity found
                </h3>
                <p className="text-amber-200/80">
                  No one has registered with the name &quot;{submittedQuery}
                  &quot;
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Result Card */}
        {hasResult && hasIdentity && !isLoadingIdentity && (
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-black/40 backdrop-blur-2xl rounded-3xl shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)] overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {identity.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-white">
                      {identity.name}
                    </h2>
                    {identity.isVerified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-emerald-300">
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 font-mono">
                    {(resolvedAddress as string)?.slice(0, 10)}...
                    {(resolvedAddress as string)?.slice(-8)}
                  </p>
                  {identity.proofURI && (
                    <a
                      href={identity.proofURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      {identity.proofURI.length > 40
                        ? `${identity.proofURI.slice(0, 40)}...`
                        : identity.proofURI}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                <Link
                  href={`/profile?address=${resolvedAddress}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(resolvedAddress as string);
                  }}
                >
                  Copy Address
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-4 p-3 rounded-xl bg-white/5 text-center">
                <p className="text-xs text-gray-500">MEMBER SINCE</p>
                <p className="text-sm text-gray-300">
                  {new Date(
                    Number(identity.registeredAt) * 1000,
                  ).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="border-white/10 bg-black/20 backdrop-blur p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-white/80 mb-2">
            Search Tips
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Names are case-sensitive as registered</li>
            <li>• Only registered identities can be found</li>
            <li>• Use the exact name they registered with</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
