"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { Loader2, AlertTriangle, Coins, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useStakeConfig,
  useInitiateDispute,
  DISPUTE_REASONS,
} from "@/hooks/useDisputes";

// ============================================================================
// PROPS
// ============================================================================

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: `0x${string}`;
}

// ============================================================================
// DISPUTE MODAL
// ============================================================================

export function DisputeModal({ isOpen, onClose, recordId }: DisputeModalProps) {
  const [reason, setReason] = useState<number>(1);
  const [evidenceURI, setEvidenceURI] = useState("");

  const { config, isLoading: isLoadingConfig } = useStakeConfig();
  const { initiateDispute, isPending, isConfirming, isConfirmed } =
    useInitiateDispute();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    initiateDispute(recordId, reason, evidenceURI, config.minStakeAmount);
  };

  // Close on success
  if (isConfirmed) {
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-red-500/10 p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Dispute Content</h2>
            <p className="text-xs text-white/40">
              Stake ETH to flag this record for review
            </p>
          </div>
        </div>

        {/* Record ID */}
        <div className="px-3 py-2 rounded-lg bg-white/5 font-mono text-[10px] text-white/30 truncate">
          Record: {recordId}
        </div>

        {/* Stake Info */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <Coins className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-white/50">Required Stake</p>
            {isLoadingConfig ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/40 mt-1" />
            ) : (
              <p className="text-lg font-bold text-white">
                {config?.minStakeAmountFormatted ?? "—"}{" "}
                <span className="text-sm text-white/40">ETH</span>
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-red-500/50 focus:outline-none appearance-none cursor-pointer"
            >
              {Object.entries(DISPUTE_REASONS)
                .filter(([key]) => Number(key) > 0)
                .map(([key, label]) => (
                  <option
                    key={key}
                    value={key}
                    className="bg-neutral-900 text-white"
                  >
                    {label}
                  </option>
                ))}
            </select>
          </div>

          {/* Evidence URI */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">
              Evidence Link
            </label>
            <Input
              value={evidenceURI}
              onChange={(e) => setEvidenceURI(e.target.value)}
              placeholder="https://drive.google.com/... or ipfs://..."
              className="bg-white/5 border-white/10 focus:border-red-500/50"
              required
            />
            <p className="text-[10px] text-white/30">
              Link to proof supporting your claim (Google Drive, IPFS, etc.)
            </p>
          </div>

          {/* Warning */}
          <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80">
            ⚠ Your stake will be locked until the dispute is resolved. If your
            claim is rejected, you may lose part or all of your stake.
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={
              isPending || isConfirming || isLoadingConfig || !evidenceURI
            }
            className="w-full h-11 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-semibold shadow-lg shadow-red-500/20 transition-all"
          >
            {isPending || isConfirming ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isPending ? "Confirm in Wallet..." : "Processing..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Stake & Submit Dispute
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
