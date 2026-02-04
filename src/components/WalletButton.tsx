"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import {
  Wallet,
  LogOut,
  AlertTriangle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";
import { TARGET_CHAIN_ID, TARGET_CHAIN } from "@/lib/wagmi-config";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function WalletButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);

  const isWrongNetwork = isConnected && chainId !== TARGET_CHAIN_ID;

  // Handle wrong network
  if (isWrongNetwork) {
    return (
      <Button
        variant="danger"
        onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
        className="gap-2"
      >
        <AlertTriangle className="w-4 h-4" />
        <span>Switch to {TARGET_CHAIN.name}</span>
      </Button>
    );
  }

  // Connected state
  if (isConnected && address) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowDropdown(!showDropdown)}
          className="gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-axiom-green animate-pulse" />
          <span className="font-mono">{truncateAddress(address)}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-xl z-50 overflow-hidden animate-slide-up">
              <div className="p-3 border-b border-white/10">
                <p className="text-xs text-white/50">Connected Wallet</p>
                <p className="font-mono text-sm text-white truncate">
                  {address}
                </p>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-sm text-axiom-red hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Not connected - show connect button
  return (
    <Button
      onClick={() => {
        // Use the first available connector (usually MetaMask)
        const connector = connectors[0];
        if (connector) {
          connect({ connector });
        }
      }}
      disabled={isConnecting || isPending}
      className="gap-2"
    >
      {isConnecting || isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      <span>
        {isConnecting || isPending ? "Connecting..." : "Connect Wallet"}
      </span>
    </Button>
  );
}

// Network indicator component
export function NetworkIndicator() {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  const isCorrectNetwork = chainId === TARGET_CHAIN_ID;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        isCorrectNetwork
          ? "bg-axiom-green/20 text-axiom-green"
          : "bg-axiom-red/20 text-axiom-red",
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isCorrectNetwork ? "bg-axiom-green animate-pulse" : "bg-axiom-red",
        )}
      />
      {isCorrectNetwork ? TARGET_CHAIN.name : "Wrong Network"}
    </div>
  );
}
