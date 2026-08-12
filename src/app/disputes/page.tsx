"use client";

import { useAccount, useReadContracts } from "wagmi";
import {
  Loader2,
  Gavel,
  Shield,
  User,
  Clock,
  ExternalLink,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WalletButton } from "@/components/WalletButton";
import { useMyDisputes } from "@/hooks/useDisputes";
import {
  disputeReasonLabel,
  disputeStatusLabel,
  formatTokenAmount,
  ZERO_ADDRESS,
  resolveContentUri,
  type TokenMetadata,
} from "@/lib/axiom-domain";
import { ERC20_ABI } from "@/lib/contracts/erc20";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

// ============================================================================
// STATUS BADGE STYLES
// ============================================================================

const statusStyles: Record<number, string> = {
  0: "bg-amber-500/20 text-amber-300", // Pending
  1: "bg-blue-500/20 text-blue-300", // Responded
  2: "bg-emerald-500/20 text-emerald-300", // Upheld
  3: "bg-red-500/20 text-red-300", // Rejected
  4: "bg-purple-500/20 text-purple-300", // Partial
  5: "bg-orange-500/20 text-orange-300", // Appealed
  6: "bg-gray-500/20 text-gray-300", // Expired
};

// ============================================================================
// DISPUTES PAGE
// ============================================================================

export default function DisputesPage() {
  const { isConnected, address } = useAccount();
  const { disputes, totalDisputes, isLoading, error, partialFailure } =
    useMyDisputes(address);
  const stakeTokens = Array.from(
    new Set(
      disputes
        .map((dispute) => dispute.stakeToken)
        .filter((token) => token.toLowerCase() !== ZERO_ADDRESS),
    ),
  );
  const { data: tokenData, isLoading: isLoadingTokens } = useReadContracts({
    contracts: stakeTokens.flatMap((token) => [
      {
        address: token,
        abi: ERC20_ABI,
        chainId: TARGET_CHAIN_ID,
        functionName: "decimals" as const,
      },
      {
        address: token,
        abi: ERC20_ABI,
        chainId: TARGET_CHAIN_ID,
        functionName: "symbol" as const,
      },
    ]),
    query: { enabled: stakeTokens.length > 0, staleTime: Infinity },
  });
  const tokenMetadata = new Map<string, TokenMetadata>();
  stakeTokens.forEach((token, index) => {
    const decimals = tokenData?.[index * 2];
    const symbol = tokenData?.[index * 2 + 1];
    if (decimals?.status === "success" && symbol?.status === "success") {
      tokenMetadata.set(token.toLowerCase(), {
        decimals: Number(decimals.result),
        symbol: String(symbol.result),
      });
    }
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">My Disputes</h1>
          </div>
          <p className="text-white/60 max-w-lg mx-auto">
            Stake-backed disputes you&apos;ve filed as a challenger.
          </p>
        </div>

        {/* Not Connected */}
        {!isConnected && (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-12 rounded-3xl">
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white/80">
                Connect Your Wallet
              </h3>
              <p className="text-white/40 text-sm max-w-md mx-auto">
                Connect your wallet to view disputes you&apos;ve filed.
              </p>
              <WalletButton />
            </div>
          </Card>
        )}

        {/* Connected — Content */}
        {isConnected && (
          <>
            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-sm text-white/70">
                  {totalDisputes} Dispute{totalDisputes !== 1 ? "s" : ""} Filed
                </span>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                <p className="text-white/40 text-sm">Loading disputes...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <Card className="border-red-500/30 bg-red-950/30 backdrop-blur-xl p-6 rounded-2xl">
                <p className="text-red-300 text-sm">{error.message}</p>
              </Card>
            )}

            {partialFailure && !error && (
              <Card className="border-amber-500/30 bg-amber-950/20 p-4">
                <p className="text-sm text-amber-200">
                  Some dispute details could not be loaded. Refresh before
                  acting on the displayed state.
                </p>
              </Card>
            )}

            {/* Empty */}
            {!isLoading && !error && disputes.length === 0 && (
              <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-12 rounded-3xl">
                <div className="text-center space-y-4">
                  <Gavel className="w-16 h-16 text-gray-600 mx-auto" />
                  <h3 className="text-xl font-semibold text-white/60">
                    No Disputes Filed
                  </h3>
                  <p className="text-white/40 text-sm max-w-md mx-auto">
                    You haven&apos;t filed any disputes yet. Visit a user&apos;s
                    profile and click &quot;Report&quot; on suspicious content.
                  </p>
                </div>
              </Card>
            )}

            {/* Dispute Cards */}
            {!isLoading && disputes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {disputes.map((dispute) => (
                  <Card
                    key={dispute.disputeId}
                    className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl hover:border-white/20 transition-all duration-300 group"
                  >
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                    <CardContent className="p-5 space-y-4">
                      {/* Header row — ID + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-white/40 mb-0.5">
                            Dispute ID
                          </p>
                          <p className="font-mono text-sm text-white truncate max-w-[220px]">
                            {dispute.disputeId.slice(0, 10)}...
                            {dispute.disputeId.slice(-6)}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                            statusStyles[dispute.status] ?? statusStyles[0]
                          }`}
                        >
                          {disputeStatusLabel(dispute.status)}
                        </span>
                      </div>

                      {/* Record */}
                      <div className="px-3 py-2 rounded-lg bg-white/5 font-mono text-[10px] text-white/30 truncate">
                        Record: {dispute.recordId}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {/* Challenger */}
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">
                            Challenger
                          </p>
                          <p className="flex items-center gap-1 text-white/70 font-mono text-xs">
                            <User className="w-3 h-3 flex-shrink-0" />
                            {dispute.challenger.slice(0, 6)}...
                            {dispute.challenger.slice(-4)}
                          </p>
                        </div>

                        {/* Reason */}
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">
                            Reason
                          </p>
                          <p className="flex items-center gap-1 text-white/70 text-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            {disputeReasonLabel(dispute.reason)}
                          </p>
                        </div>

                        {/* Stake */}
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">
                            Stake
                          </p>
                          <p className="text-white font-semibold text-xs">
                            {dispute.stakeToken.toLowerCase() === ZERO_ADDRESS
                              ? formatTokenAmount(dispute.stakeAmount, {
                                  decimals: 18,
                                  symbol: "ETH",
                                })
                              : tokenMetadata.has(dispute.stakeToken.toLowerCase())
                                ? formatTokenAmount(
                                    dispute.stakeAmount,
                                    tokenMetadata.get(
                                      dispute.stakeToken.toLowerCase(),
                                    )!,
                                  )
                                : isLoadingTokens
                                  ? "Loading token…"
                                  : `${dispute.stakeAmount.toString()} token units`}
                          </p>
                        </div>

                        {/* Created */}
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">
                            Filed
                          </p>
                          <p className="flex items-center gap-1 text-white/70 text-xs">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            {dispute.createdAt > 0
                              ? new Date(
                                  dispute.createdAt * 1000,
                                ).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Evidence link */}
                      {dispute.evidenceURI &&
                        resolveContentUri(dispute.evidenceURI) && (
                        <a
                          href={resolveContentUri(dispute.evidenceURI)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Evidence
                        </a>
                        )}

                      {/* Deadline */}
                      {dispute.deadline > 0 && (
                        <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          Response deadline:{" "}
                          {new Date(dispute.deadline * 1000).toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
