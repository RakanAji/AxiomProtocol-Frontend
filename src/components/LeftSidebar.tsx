"use client";

import { useEffect, useState } from "react";
import { useReadContracts, useReadContract, useAccount } from "wagmi";
import { formatEther } from "viem";
import {
  Database,
  Coins,
  Server,
  Activity,
  User,
  FileCheck,
  AlertTriangle,
  Clock,
  Fingerprint,
} from "lucide-react";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { cn } from "@/lib/utils";
import Link from "next/link";

const contractConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
} as const;

interface RecentFile {
  name: string;
  hash: string;
  timestamp: number;
}

export function LeftSidebar() {
  const { address, isConnected } = useAccount();
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // Protocol stats
  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...contractConfig, functionName: "getTotalRecords" },
      { ...contractConfig, functionName: "getTotalFeesCollected" },
      { ...contractConfig, functionName: "getBaseFee" },
      { ...contractConfig, functionName: "paused" },
    ],
    query: {
      refetchInterval: 30000,
    },
  });

  // User's records
  const { data: userRecords } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getRecordsByIssuer",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // User's identity
  const { data: userIdentity } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "resolveIdentity",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Load recent files from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("axiom-recent-files");
      if (stored) {
        try {
          setRecentFiles(JSON.parse(stored).slice(0, 5));
        } catch {
          setRecentFiles([]);
        }
      }
    }
  }, []);

  const totalRecords = data?.[0]?.result as bigint | undefined;
  const totalFees = data?.[1]?.result as bigint | undefined;
  const baseFee = data?.[2]?.result as bigint | undefined;
  const isPaused = data?.[3]?.result as boolean | undefined;

  const userRecordCount =
    (userRecords as `0x${string}`[] | undefined)?.length || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const identity = userIdentity as any;
  const hasIdentity = identity && Number(identity.registeredAt) > 0;
  const isVerified = identity?.isVerified;

  const formatETH = (wei: bigint | undefined) => {
    if (wei === undefined) return "—";
    const eth = formatEther(wei);
    return parseFloat(eth).toFixed(4);
  };

  const truncateHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <aside className="hidden xl:flex flex-col fixed left-0 top-16 bottom-0 w-60 p-4 z-40 overflow-y-auto">
      <div className="flex-1 flex flex-col gap-6">
        {/* Protocol Stats */}
        <div>
          <div className="flex items-center gap-2 px-2 mb-3">
            <Activity className="w-4 h-4 text-axiom-cyan" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Protocol Stats
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <StatItem
              icon={Database}
              iconColor="text-axiom-cyan"
              label="Total Records"
              value={isLoading ? "..." : totalRecords?.toString() || "0"}
            />
            <StatItem
              icon={Coins}
              iconColor="text-axiom-purple"
              label="Revenue"
              value={isLoading ? "..." : `${formatETH(totalFees)} ETH`}
            />
            <StatItem
              icon={Coins}
              iconColor="text-axiom-pink"
              label="Base Fee"
              value={isLoading ? "..." : `${formatETH(baseFee)} ETH`}
            />
            <StatItem
              icon={Server}
              iconColor={isPaused ? "text-red-400" : "text-axiom-green"}
              label="Status"
              value={isLoading ? "..." : isPaused ? "Paused" : "Operational"}
              valueColor={isPaused ? "text-red-400" : "text-axiom-green"}
            />
          </div>
        </div>

        {/* Your Stats - Only if connected */}
        {isConnected && (
          <div>
            <div className="flex items-center gap-2 px-2 mb-3">
              <User className="w-4 h-4 text-axiom-purple" />
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Your Stats
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <StatItem
                icon={FileCheck}
                iconColor="text-axiom-cyan"
                label="Your Records"
                value={userRecordCount.toString()}
              />
              <StatItem
                icon={Fingerprint}
                iconColor={hasIdentity ? "text-axiom-green" : "text-white/30"}
                label="Identity"
                value={
                  hasIdentity
                    ? isVerified
                      ? "Verified ✓"
                      : "Registered"
                    : "Not Set"
                }
                valueColor={
                  hasIdentity
                    ? isVerified
                      ? "text-axiom-green"
                      : "text-axiom-cyan"
                    : "text-white/40"
                }
              />
              <StatItem
                icon={AlertTriangle}
                iconColor="text-amber-400"
                label="Disputes"
                value="0"
              />
            </div>
          </div>
        )}

        {/* Recent Files */}
        <div>
          <div className="flex items-center gap-2 px-2 mb-3">
            <Clock className="w-4 h-4 text-axiom-pink" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Recent Files
            </span>
          </div>
          {recentFiles.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentFiles.map((file, i) => (
                <Link
                  key={i}
                  href={`/verify?hash=${file.hash}`}
                  className="p-2 rounded-lg border border-white/5 bg-black/30 hover:border-white/10 transition-colors"
                >
                  <p className="text-xs text-white/70 truncate">{file.name}</p>
                  <p className="text-xs text-white/30 font-mono">
                    {truncateHash(file.hash)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30 px-2">No recent files</p>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <div className="flex items-center gap-2 px-2 mb-3">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Quick Links
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href="/leaderboard"
              className="px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              🏆 Leaderboard
            </Link>
            <Link
              href="/changelog"
              className="px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              📋 Changelog
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  value: string;
  valueColor?: string;
}

function StatItem({
  icon: Icon,
  iconColor,
  label,
  value,
  valueColor = "text-white",
}: StatItemProps) {
  return (
    <div className="p-3 rounded-xl border border-white/5 bg-black/30 backdrop-blur-sm hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-3.5 h-3.5", iconColor)} />
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <p className={cn("text-lg font-semibold tabular-nums", valueColor)}>
        {value}
      </p>
    </div>
  );
}
