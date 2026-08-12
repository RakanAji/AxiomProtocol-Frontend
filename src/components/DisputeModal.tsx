"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Coins, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useInitiateDispute,
  useStakeConfig,
} from "@/hooks/useDisputes";
import { useTokenMetadata } from "@/hooks/useLicense";
import {
  DISPUTE_REASONS,
  formatTokenAmount,
  resolveContentUri,
} from "@/lib/axiom-domain";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  recordId: `0x${string}`;
}

export function DisputeModal({
  isOpen,
  onClose,
  onSuccess,
  recordId,
}: DisputeModalProps) {
  const [reason, setReason] = useState(0);
  const [evidenceURI, setEvidenceURI] = useState("");
  const stakeQuery = useStakeConfig();
  const tokenQuery = useTokenMetadata(stakeQuery.config?.stakeToken);
  const dispute = useInitiateDispute();
  const resetDispute = dispute.reset;
  const disputeConfirmed = dispute.isConfirmed;
  const isBusy = dispute.isPending || dispute.isConfirming;

  useEffect(() => {
    if (!isOpen) return;
    setReason(0);
    setEvidenceURI("");
    resetDispute();
  }, [isOpen, resetDispute]);

  useEffect(() => {
    if (!disputeConfirmed) return;
    onSuccess?.();
    onClose();
  }, [disputeConfirmed, onClose, onSuccess]);

  const evidenceIsValid = !!resolveContentUri(evidenceURI.trim());
  const stakeLabel =
    stakeQuery.config && tokenQuery.metadata
      ? formatTokenAmount(stakeQuery.config.minStakeAmount, tokenQuery.metadata)
      : "—";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!stakeQuery.config || !tokenQuery.metadata || !evidenceIsValid) return;
    void dispute.initiateDispute(
      recordId,
      reason,
      evidenceURI.trim(),
      stakeQuery.config,
    );
  };

  const handleClose = () => {
    if (!isBusy) onClose();
  };

  if (!isOpen) return null;

  const loadingLabel =
    dispute.phase === "approving"
      ? "Approving stake token…"
      : dispute.phase === "confirming"
        ? "Confirming dispute…"
        : dispute.phase === "checking"
          ? "Checking balance…"
          : "Submit in wallet…";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close dispute modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        disabled={isBusy}
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dispute-title"
        className="relative w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-black/90 p-6 shadow-2xl shadow-red-500/10"
      >
        <button
          aria-label="Close"
          disabled={isBusy}
          onClick={handleClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white disabled:opacity-30"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 id="dispute-title" className="font-bold text-white">
              Report registered content
            </h2>
            <p className="text-xs text-white/40">
              Opens a protocol dispute with the configured stake asset.
            </p>
          </div>
        </div>

        <div className="truncate rounded-lg bg-white/5 px-3 py-2 font-mono text-[10px] text-white/35">
          Record: {recordId}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <Coins className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-xs text-white/50">Required stake</p>
            {stakeQuery.isLoading || tokenQuery.isLoading ? (
              <Loader2 className="mt-1 h-4 w-4 animate-spin text-white/40" />
            ) : (
              <p className="text-lg font-bold text-white">{stakeLabel}</p>
            )}
          </div>
        </div>

        {(stakeQuery.error || tokenQuery.error) && (
          <p className="text-sm text-red-300">
            {(stakeQuery.error || tokenQuery.error)?.message.slice(0, 160)}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="dispute-reason" className="text-xs font-medium text-white/50">
              Reason
            </label>
            <select
              id="dispute-reason"
              value={reason}
              onChange={(event) => setReason(Number(event.target.value))}
              className="h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-sm text-white"
            >
              {Object.entries(DISPUTE_REASONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="evidence-uri" className="text-xs font-medium text-white/50">
              Evidence URI
            </label>
            <Input
              id="evidence-uri"
              value={evidenceURI}
              onChange={(event) => setEvidenceURI(event.target.value)}
              placeholder="ipfs://… or https://…"
              className="border-white/10 bg-white/5"
              required
            />
            {evidenceURI && !evidenceIsValid && (
              <p className="text-[10px] text-red-300">
                Use an IPFS, Arweave, HTTP, or HTTPS URI.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/75">
            The stake is locked until resolution. The protocol can slash or
            distribute it according to the dispute outcome.
          </div>

          {dispute.error && (
            <p className="break-words text-sm text-red-300">
              {dispute.error.message.slice(0, 180)}
            </p>
          )}

          <Button
            type="submit"
            disabled={
              isBusy ||
              stakeQuery.isLoading ||
              tokenQuery.isLoading ||
              !stakeQuery.config ||
              !tokenQuery.metadata ||
              !evidenceIsValid
            }
            className="h-11 w-full bg-gradient-to-r from-red-500 to-orange-500"
          >
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> {loadingLabel}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Stake and submit
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
