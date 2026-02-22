"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRespondToDispute } from "@/hooks/useDisputes";

interface RespondDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  disputeId: `0x${string}`;
}

export function RespondDisputeModal({
  isOpen,
  onClose,
  disputeId,
}: RespondDisputeModalProps) {
  const [responseURI, setResponseURI] = useState("");
  const { respondToDispute, isPending, isConfirming, isConfirmed } =
    useRespondToDispute();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    respondToDispute(disputeId, responseURI);
  };

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
      <div className="relative w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-emerald-500/10 p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Respond to Dispute</h2>
            <p className="text-xs text-white/40">
              Submit your defense evidence
            </p>
          </div>
        </div>

        {/* Dispute ID */}
        <div className="px-3 py-2 rounded-lg bg-white/5 font-mono text-[10px] text-white/30 truncate">
          Dispute: {disputeId}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">
              Defense Evidence URI
            </label>
            <Input
              value={responseURI}
              onChange={(e) => setResponseURI(e.target.value)}
              placeholder="https://drive.google.com/... or ipfs://..."
              className="bg-white/5 border-white/10 focus:border-emerald-500/50"
              required
            />
            <p className="text-[10px] text-white/30">
              Link to proof that your content is legitimate (Google Drive, IPFS,
              etc.)
            </p>
          </div>

          {/* Info */}
          <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200/80">
            ✓ Responding moves the dispute to the evidence period. If
            unresolved, it may escalate to arbitration.
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending || isConfirming || !responseURI}
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all"
          >
            {isPending || isConfirming ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isPending ? "Confirm in Wallet..." : "Processing..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Submit Response
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
