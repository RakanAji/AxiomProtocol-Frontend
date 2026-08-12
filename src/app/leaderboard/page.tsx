"use client";

import { Award, Loader2, Medal, Trophy, Users } from "lucide-react";
import { useReadContract, useReadContracts } from "wagmi";

import { Card } from "@/components/ui/card";
import { shortAddress } from "@/lib/axiom-domain";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
  IS_AXIOM_ROUTER_CONFIGURED,
  ROUTER_CONFIGURATION_ERROR,
} from "@/lib/contracts/axiom-router";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

const SAMPLE_LIMIT = 200;
const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;

interface ReadResult {
  status: "success" | "failure";
  result?: unknown;
}

export default function LeaderboardPage() {
  const totalQuery = useReadContract({
    ...routerConfig,
    functionName: "getTotalRecords",
    query: { enabled: IS_AXIOM_ROUTER_CONFIGURED, staleTime: 30_000 },
  });
  const totalRecords = Number(totalQuery.data ?? BigInt(0));
  const sampleSize = Math.min(totalRecords, SAMPLE_LIMIT);
  const sampleOffset = Math.max(0, totalRecords - sampleSize);
  const idsQuery = useReadContract({
    ...routerConfig,
    functionName: "getRecordIds",
    args: [BigInt(sampleOffset), BigInt(sampleSize)],
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED && sampleSize > 0,
      staleTime: 30_000,
    },
  });
  const recordIds =
    (idsQuery.data as readonly `0x${string}`[] | undefined) ?? [];
  const recordsQuery = useReadContracts({
    contracts: recordIds.map((id) => ({
      ...routerConfig,
      functionName: "getRecord" as const,
      args: [id] as const,
    })),
    query: { enabled: recordIds.length > 0, staleTime: 30_000 },
  });
  const results = (recordsQuery.data ?? []) as readonly ReadResult[];
  const counts = new Map<string, number>();
  results.forEach((result) => {
    if (result.status !== "success" || !result.result) return;
    const issuer = (result.result as { issuer?: string }).issuer;
    if (!issuer) return;
    counts.set(issuer, (counts.get(issuer) ?? 0) + 1);
  });
  const leaderboard = Array.from(counts, ([address, recordCount]) => ({
    address,
    recordCount,
  }))
    .sort((left, right) =>
      right.recordCount === left.recordCount
        ? left.address.localeCompare(right.address)
        : right.recordCount - left.recordCount,
    )
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const isLoading =
    totalQuery.isLoading || idsQuery.isLoading || recordsQuery.isLoading;
  const error = totalQuery.error || idsQuery.error || recordsQuery.error;
  const partialFailure = results.some((result) => result.status === "failure");

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-3 text-4xl font-bold text-gradient">Issuer Snapshot</h1>
          <p className="mx-auto max-w-xl text-white/60">
            Registration counts derived directly from the latest enumerated
            records, not from placeholder ranking data.
          </p>
        </div>

        {!IS_AXIOM_ROUTER_CONFIGURED && (
          <ErrorCard message={ROUTER_CONFIGURATION_ERROR || "Router is not configured"} />
        )}
        {error && <ErrorCard message={error.message} />}
        {partialFailure && !error && (
          <ErrorCard message="Some records failed to load, so this ranking is incomplete." />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl border-white/10 bg-black/40 p-5">
            <p className="text-sm text-white/50">Total records</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {isLoading ? "…" : totalRecords.toLocaleString()}
            </p>
          </Card>
          <Card className="rounded-2xl border-white/10 bg-black/40 p-5">
            <p className="flex items-center gap-2 text-sm text-white/50">
              <Users className="h-4 w-4" /> Issuers in snapshot
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {isLoading ? "…" : leaderboard.length}
            </p>
          </Card>
        </div>

        <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-xs text-white/45">
          Scope: latest {sampleSize.toLocaleString()} of {totalRecords.toLocaleString()} records
          {totalRecords > SAMPLE_LIMIT
            ? ". Counts are a bounded snapshot and are not an all-time ranking."
            : ". This covers every currently enumerable record."}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
          </div>
        ) : leaderboard.length === 0 && !error ? (
          <Card className="rounded-2xl border-white/10 bg-black/40 p-10 text-center text-white/45">
            No issuer records are available yet.
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-wider text-white/40">
              <div className="col-span-2">Rank</div>
              <div className="col-span-7">Issuer</div>
              <div className="col-span-3 text-right">Records</div>
            </div>
            {leaderboard.map((entry) => (
              <div
                key={entry.address}
                className="grid grid-cols-12 items-center gap-4 border-b border-white/5 px-6 py-4 last:border-0"
              >
                <div className="col-span-2">{rankIcon(entry.rank)}</div>
                <div className="col-span-7 font-mono text-sm text-white" title={entry.address}>
                  {shortAddress(entry.address)}
                </div>
                <div className="col-span-3 text-right font-semibold text-white">
                  {entry.recordCount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm text-white/40">{rank}</span>;
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="rounded-xl border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
      {message.slice(0, 180)}
    </Card>
  );
}
