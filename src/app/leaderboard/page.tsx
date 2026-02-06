"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  address: string;
  recordCount: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");

  // Get total records for display
  const { data: totalRecords } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getTotalRecords",
  });

  // Mock leaderboard data - in production this would come from an indexer
  const leaderboard: LeaderboardEntry[] = [
    { address: "0x1234...5678", recordCount: 156, rank: 1 },
    { address: "0x2345...6789", recordCount: 142, rank: 2 },
    { address: "0x3456...7890", recordCount: 128, rank: 3 },
    { address: "0x4567...8901", recordCount: 95, rank: 4 },
    { address: "0x5678...9012", recordCount: 87, rank: 5 },
    { address: "0x6789...0123", recordCount: 76, rank: 6 },
    { address: "0x7890...1234", recordCount: 64, rank: 7 },
    { address: "0x8901...2345", recordCount: 52, rank: 8 },
    { address: "0x9012...3456", recordCount: 41, rank: 9 },
    { address: "0x0123...4567", recordCount: 33, rank: 10 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm text-white/40">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Leaderboard</h1>
          <p className="text-white/60 max-w-md mx-auto">
            Top issuers ranked by content registration count
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-axiom-cyan" />
              <span className="text-sm text-white/50">Total Records</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {totalRecords?.toString() || "0"}
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-axiom-purple" />
              <span className="text-sm text-white/50">Unique Issuers</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {leaderboard.length}+
            </p>
          </div>
        </div>

        {/* Timeframe Filter */}
        <div className="flex gap-2 mb-6">
          {(["all", "month", "week"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                timeframe === tf
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5",
              )}
            >
              {tf === "all"
                ? "All Time"
                : tf === "month"
                  ? "This Month"
                  : "This Week"}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-medium text-white/40 uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-7">Issuer</div>
            <div className="col-span-4 text-right">Records</div>
          </div>

          {/* Rows */}
          {leaderboard.map((entry, index) => (
            <div
              key={entry.address}
              className={cn(
                "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-white/5",
                index !== leaderboard.length - 1 && "border-b border-white/5",
              )}
            >
              <div className="col-span-1">{getRankIcon(entry.rank)}</div>
              <div className="col-span-7">
                <span className="font-mono text-sm text-white">
                  {entry.address}
                </span>
              </div>
              <div className="col-span-4 text-right">
                <span
                  className={cn(
                    "text-lg font-semibold",
                    entry.rank === 1
                      ? "text-yellow-400"
                      : entry.rank === 2
                        ? "text-gray-300"
                        : entry.rank === 3
                          ? "text-amber-600"
                          : "text-white",
                  )}
                >
                  {entry.recordCount}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-xs text-white/30 mt-6">
          Rankings update in real-time based on on-chain activity
        </p>
      </div>
    </div>
  );
}
