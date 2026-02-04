"use client";

import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Clock,
  Link,
  FileCheck,
} from "lucide-react";
import { truncateAddress, formatTimestamp } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { VerificationResult } from "@/hooks/useAxiomContract";

interface VerificationResultProps {
  result: VerificationResult | undefined;
  isLoading: boolean;
  error?: Error | null;
  contentHash?: string;
}

export function VerificationResultDisplay({
  result,
  isLoading,
  error,
  contentHash,
}: VerificationResultProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
            <Shield className="w-10 h-10 text-white/30" />
          </div>
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="h-4 w-48 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-axiom-red/30 bg-axiom-red/5 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-axiom-red/20 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-axiom-red" />
          </div>
          <h3 className="text-xl font-bold text-axiom-red">
            Verification Error
          </h3>
          <p className="text-sm text-white/60 text-center max-w-sm">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  // No result yet
  if (!result) {
    return null;
  }

  const isAuthentic =
    result.isValid &&
    result.issuer !== "0x0000000000000000000000000000000000000000";

  return (
    <div
      className={cn(
        "p-8 rounded-2xl border backdrop-blur-md transition-all duration-500",
        isAuthentic
          ? "border-axiom-green/30 bg-axiom-green/5 shadow-glow-green"
          : "border-axiom-red/30 bg-axiom-red/5 shadow-glow-red animate-breach-alert",
      )}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Status Icon */}
        <div
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center",
            isAuthentic
              ? "bg-axiom-green/20 animate-shield-lock"
              : "bg-axiom-red/20",
          )}
        >
          {isAuthentic ? (
            <ShieldCheck className="w-12 h-12 text-axiom-green" />
          ) : (
            <ShieldAlert className="w-12 h-12 text-axiom-red" />
          )}
        </div>

        {/* Status Title */}
        <div className="text-center">
          <h3
            className={cn(
              "text-3xl font-bold mb-2",
              isAuthentic ? "text-axiom-green" : "text-axiom-red",
            )}
          >
            {isAuthentic ? "AUTHENTIC" : "BREACH DETECTED"}
          </h3>
          <p className="text-white/60">
            {isAuthentic
              ? "This content has been verified on the blockchain"
              : "This content is not registered or has been tampered with"}
          </p>
        </div>

        {/* Details */}
        {isAuthentic && (
          <div className="w-full max-w-md space-y-4 pt-6 border-t border-white/10">
            {/* Issuer */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-full bg-axiom-purple/20 flex items-center justify-center">
                <User className="w-5 h-5 text-axiom-purple" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50">Signed by</p>
                <p className="font-mono text-sm text-white truncate">
                  {result.issuer}
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-full bg-axiom-cyan/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-axiom-cyan" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/50">Registered on</p>
                <p className="text-sm text-white">
                  {formatTimestamp(result.timestamp)}
                </p>
              </div>
            </div>

            {/* Metadata URI */}
            {result.uri && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-10 h-10 rounded-full bg-axiom-pink/20 flex items-center justify-center">
                  <Link className="w-5 h-5 text-axiom-pink" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50">Metadata</p>
                  <p className="font-mono text-sm text-white truncate">
                    {result.uri}
                  </p>
                </div>
              </div>
            )}

            {/* Content Hash */}
            {contentHash && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50">Content Hash</p>
                  <p className="font-mono text-xs text-white/70 break-all">
                    {contentHash}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
