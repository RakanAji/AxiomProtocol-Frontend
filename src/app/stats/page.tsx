"use client";

import { useState } from "react";
import { useReadContracts } from "wagmi";
import { formatEther } from "viem";
import {
  Activity,
  Database,
  Coins,
  Server,
  RefreshCw,
  Shield,
} from "lucide-react";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Contract read configurations
const contractConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
} as const;

export default function StatsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all protocol stats in parallel
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...contractConfig, functionName: "getTotalRecords" },
      { ...contractConfig, functionName: "getTotalFeesCollected" },
      { ...contractConfig, functionName: "getBaseFee" },
      { ...contractConfig, functionName: "VERSION" },
      { ...contractConfig, functionName: "paused" },
    ],
  });

  // Parse results
  const totalRecords = data?.[0]?.result as bigint | undefined;
  const totalFees = data?.[1]?.result as bigint | undefined;
  const baseFee = data?.[2]?.result as bigint | undefined;
  const version = data?.[3]?.result as string | undefined;
  const isPaused = data?.[4]?.result as boolean | undefined;

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Format large numbers with commas
  const formatNumber = (num: bigint | undefined) => {
    if (num === undefined) return "—";
    return Number(num).toLocaleString();
  };

  // Format ETH values
  const formatETH = (wei: bigint | undefined) => {
    if (wei === undefined) return "—";
    const eth = formatEther(wei);
    // Show up to 6 decimal places, remove trailing zeros
    const formatted = parseFloat(eth)
      .toFixed(6)
      .replace(/\.?0+$/, "");
    return `${formatted} ETH`;
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          {/* Live Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-axiom-green" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-axiom-green animate-ping" />
            </div>
            <span className="text-sm text-white/70">Live</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Axiom <span className="text-gradient">Network Status</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Real-time protocol metrics and transparency dashboard for the Axiom
            Protocol on the blockchain.
          </p>

          {/* Refresh Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin")}
              />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Total Truths Mined */}
          <StatCard
            icon={Database}
            iconColor="text-axiom-cyan"
            iconBgColor="bg-axiom-cyan/20"
            glowColor="shadow-[0_0_60px_-15px_rgba(0,245,255,0.5)]"
            borderColor="hover:border-axiom-cyan/40"
            title="Total Truths Mined"
            value={formatNumber(totalRecords)}
            subtitle="Content records registered"
            isLoading={isLoading}
          />

          {/* Protocol Revenue */}
          <StatCard
            icon={Coins}
            iconColor="text-axiom-purple"
            iconBgColor="bg-axiom-purple/20"
            glowColor="shadow-[0_0_60px_-15px_rgba(168,85,247,0.5)]"
            borderColor="hover:border-axiom-purple/40"
            title="Protocol Revenue"
            value={formatETH(totalFees)}
            subtitle="Total fees collected"
            isLoading={isLoading}
          />

          {/* Current Base Fee */}
          <StatCard
            icon={Coins}
            iconColor="text-axiom-pink"
            iconBgColor="bg-axiom-pink/20"
            glowColor="shadow-[0_0_60px_-15px_rgba(236,72,153,0.5)]"
            borderColor="hover:border-axiom-pink/40"
            title="Current Base Fee"
            value={formatETH(baseFee)}
            subtitle="Cost to register content"
            isLoading={isLoading}
          />

          {/* System Status */}
          <StatCard
            icon={Server}
            iconColor={isPaused ? "text-red-400" : "text-axiom-green"}
            iconBgColor={isPaused ? "bg-red-500/20" : "bg-axiom-green/20"}
            glowColor={
              isPaused
                ? "shadow-[0_0_60px_-15px_rgba(239,68,68,0.5)]"
                : "shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]"
            }
            borderColor={
              isPaused
                ? "hover:border-red-500/40"
                : "hover:border-axiom-green/40"
            }
            title="System Status"
            value={
              isPaused === undefined ? "—" : isPaused ? "Paused" : "Operational"
            }
            valueColor={isPaused ? "text-red-400" : "text-axiom-green"}
            subtitle={
              isPaused
                ? "Protocol is temporarily paused"
                : "All systems running"
            }
            isLoading={isLoading}
          />
        </div>

        {/* Contract Info */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-axiom-cyan" />
            <span className="text-sm text-white/70">Contract Version:</span>
            <span className="text-sm text-white font-mono">
              {version || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm">
            <Activity className="w-4 h-4 text-axiom-purple" />
            <span className="text-sm text-white/70">Router:</span>
            <span className="text-sm text-white/50 font-mono truncate max-w-[140px]">
              {AXIOM_ROUTER_ADDRESS}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBgColor: string;
  glowColor: string;
  borderColor: string;
  title: string;
  value: string;
  valueColor?: string;
  subtitle: string;
  isLoading: boolean;
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  glowColor,
  borderColor,
  title,
  value,
  valueColor = "text-white",
  subtitle,
  isLoading,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300",
        glowColor,
        borderColor,
      )}
    >
      <div className="flex items-start gap-5">
        <div className={cn("p-4 rounded-2xl", iconBgColor)}>
          <Icon className={cn("w-8 h-8", iconColor)} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-white/50 uppercase tracking-wider">
            {title}
          </p>
          {isLoading ? (
            <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse" />
          ) : (
            <p className={cn("text-4xl font-bold tabular-nums", valueColor)}>
              {value}
            </p>
          )}
          <p className="text-sm text-white/40">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
