"use client";

import { useState, useEffect } from "react";
import { useWatchContractEvent, usePublicClient } from "wagmi";
import { Radio, ExternalLink, Fuel } from "lucide-react";
import { formatGwei } from "viem";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  issuer: string;
  contentHash: string;
  timestamp: Date;
}

export function RightSidebar() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const publicClient = usePublicClient();

  // Watch for ContentRegistered events
  useWatchContractEvent({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    eventName: "ContentRegistered",
    onLogs(logs) {
      const newActivities = logs.map((log) => {
        const args = log.args as {
          recordId?: `0x${string}`;
          issuer?: `0x${string}`;
          contentHash?: `0x${string}`;
        };
        return {
          id: args.recordId || `${Date.now()}`,
          issuer: args.issuer || "0x...",
          contentHash: args.contentHash || "0x...",
          timestamp: new Date(),
        };
      });

      setActivities((prev) => [...newActivities, ...prev].slice(0, 10));
    },
  });

  // Fetch gas price
  useEffect(() => {
    const fetchGasPrice = async () => {
      if (publicClient) {
        try {
          const price = await publicClient.getGasPrice();
          setGasPrice(price);
        } catch {
          setGasPrice(null);
        }
      }
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, [publicClient]);

  // Add mock initial activity for demo
  useEffect(() => {
    if (activities.length === 0) {
      setActivities([
        {
          id: "demo-1",
          issuer: "0x0000...0000",
          contentHash: "Waiting for activity...",
          timestamp: new Date(),
        },
      ]);
    }
  }, [activities.length]);

  const truncateAddress = (addr: string) => {
    if (addr.length <= 13) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatGas = (wei: bigint) => {
    const gwei = parseFloat(formatGwei(wei));
    return gwei.toFixed(2);
  };

  // Calculate gas levels
  const getGasLevel = (price: bigint) => {
    const gwei = parseFloat(formatGwei(price));
    if (gwei < 20) return { label: "Low", color: "text-axiom-green" };
    if (gwei < 50) return { label: "Medium", color: "text-amber-400" };
    return { label: "High", color: "text-red-400" };
  };

  return (
    <aside className="hidden xl:flex flex-col fixed right-0 top-16 bottom-0 w-72 p-4 z-40 overflow-y-auto">
      <div className="flex-1 flex flex-col gap-6">
        {/* Gas Tracker */}
        <div>
          <div className="flex items-center gap-2 px-2 mb-3">
            <Fuel className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Gas Tracker
            </span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-black/30 backdrop-blur-sm">
            {gasPrice ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">
                    {formatGas(gasPrice)}
                  </span>
                  <span className="text-xs text-white/40">Gwei</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getGasLevel(gasPrice).color.replace("text-", "bg-"),
                    )}
                  />
                  <span className={cn("text-xs", getGasLevel(gasPrice).color)}>
                    {getGasLevel(gasPrice).label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-xs text-axiom-green font-semibold">
                      {formatGas((gasPrice * BigInt(80)) / BigInt(100))}
                    </p>
                    <p className="text-xs text-white/30">Slow</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-400 font-semibold">
                      {formatGas(gasPrice)}
                    </p>
                    <p className="text-xs text-white/30">Avg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-red-400 font-semibold">
                      {formatGas((gasPrice * BigInt(120)) / BigInt(100))}
                    </p>
                    <p className="text-xs text-white/30">Fast</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-white/40">Loading...</p>
            )}
          </div>
        </div>

        {/* Live Activity */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className="relative">
              <Radio className="w-4 h-4 text-axiom-green" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-axiom-green rounded-full animate-ping" />
            </div>
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Live Activity
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-3 rounded-xl border border-white/5 bg-black/30 backdrop-blur-sm hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-axiom-cyan font-mono">
                    {truncateAddress(activity.issuer)}
                  </span>
                  <span className="text-xs text-white/30">
                    {timeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-white/50 truncate">
                  Registered content
                </p>
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3 h-3 text-white/30" />
                  <span className="text-xs text-white/30">
                    View on explorer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
