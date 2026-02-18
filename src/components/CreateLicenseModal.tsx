"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Tag, DollarSign, Percent, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLicense } from "@/hooks/useLicense";

interface CreateLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: `0x${string}`;
}

export function CreateLicenseModal({
  isOpen,
  onClose,
  recordId,
}: CreateLicenseModalProps) {
  const [licenseType, setLicenseType] = useState<number>(1);
  const [priceEth, setPriceEth] = useState<string>("");
  const [royaltyPercent, setRoyaltyPercent] = useState<number>(5);
  const [exclusive, setExclusive] = useState<boolean>(false);

  const { createLicense, isPending, isConfirming, isConfirmed, reset } =
    useCreateLicense();

  // Close modal on success
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        onClose();
        reset();
        // Reset form
        setPriceEth("");
        setRoyaltyPercent(5);
        setExclusive(false);
        setLicenseType(1);
      }, 1500);
    }
  }, [isConfirmed, onClose, reset]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLicense({
      recordId,
      licenseType,
      priceEth: priceEth || "0",
      royaltyPercent,
      exclusive,
    });
  };

  const isLoading = isPending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Create License
              </h2>
              <p className="text-xs text-white/40 font-mono">
                {recordId.slice(0, 10)}...{recordId.slice(-8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* License Type */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" />
              License Type
            </Label>
            <select
              value={licenseType}
              onChange={(e) => setLicenseType(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value={1} className="bg-gray-900">
                Personal Use
              </option>
              <option value={2} className="bg-gray-900">
                Commercial Use
              </option>
            </select>
          </div>

          {/* Price (ETH) */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5" />
              Price (ETH)
            </Label>
            <div className="relative">
              <Input
                type="number"
                step="0.001"
                min="0"
                placeholder="0.01"
                value={priceEth}
                onChange={(e) => setPriceEth(e.target.value)}
                className="bg-white/5 border-white/10 text-white pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 font-mono">
                ETH
              </span>
            </div>
          </div>

          {/* Royalty (%) */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <Percent className="w-3.5 h-3.5" />
              Royalty (%)
            </Label>
            <div className="relative">
              <Input
                type="number"
                step="1"
                min="0"
                max="100"
                placeholder="5"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(Number(e.target.value) || 0)}
                className="bg-white/5 border-white/10 text-white pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
                = {royaltyPercent * 100} bps
              </span>
            </div>
          </div>

          {/* Exclusive Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/80">Exclusive License</span>
            </div>
            <button
              type="button"
              onClick={() => setExclusive(!exclusive)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                exclusive ? "bg-cyan-500" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  exclusive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Defaults info */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white/40 space-y-1">
            <p>• Payment: Native ETH</p>
            <p>• Validity: Forever (no expiry)</p>
            <p>• Sublicensable: No</p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !priceEth}
            className="w-full h-11 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirm in Wallet...
              </span>
            ) : isConfirming ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming on Chain...
              </span>
            ) : isConfirmed ? (
              <span className="text-emerald-200">✓ License Created!</span>
            ) : (
              "Create License"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
