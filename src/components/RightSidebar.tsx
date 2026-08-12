"use client";

import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { Fuel, Network } from "lucide-react";
import { formatGwei } from "viem";
import {
  IS_AXIOM_ROUTER_CONFIGURED,
  ROUTER_CONFIGURATION_ERROR,
} from "@/lib/contracts/axiom-router";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

export function RightSidebar() {
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const publicClient = usePublicClient({ chainId: TARGET_CHAIN_ID });

  // Fetch gas price
  useEffect(() => {
    const fetchGasPrice = async () => {
      if (publicClient && IS_AXIOM_ROUTER_CONFIGURED) {
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

  const formatGas = (wei: bigint) => {
    const gwei = parseFloat(formatGwei(wei));
    return gwei.toFixed(2);
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
                <p className="text-xs text-white/35">
                  Latest RPC gas price; not a transaction quote.
                </p>
              </>
            ) : (
              <p className="text-xs text-white/40">Loading...</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 px-2 mb-3">
            <Network className="w-4 h-4 text-axiom-green" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Deployment
            </span>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4 text-xs">
            <p
              className={
                IS_AXIOM_ROUTER_CONFIGURED
                  ? "text-axiom-green"
                  : "text-amber-300"
              }
            >
              {IS_AXIOM_ROUTER_CONFIGURED
                ? "Router configured"
                : "Router unavailable"}
            </p>
            <p className="mt-2 text-white/35">
              {ROUTER_CONFIGURATION_ERROR ||
                `Reads and writes target chain ID ${TARGET_CHAIN_ID}.`}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
