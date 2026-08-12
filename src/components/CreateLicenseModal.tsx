"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Coins, Loader2, Lock, Percent, Tag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLicense, useTokenMetadata } from "@/hooks/useLicense";
import {
  LICENSE_TYPES,
  ZERO_ADDRESS,
  isEthereumAddress,
} from "@/lib/axiom-domain";

interface CreateLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  recordId: `0x${string}`;
}

type PaymentMode = "eth" | "erc20";

export function CreateLicenseModal({
  isOpen,
  onClose,
  onSuccess,
  recordId,
}: CreateLicenseModalProps) {
  const [licenseType, setLicenseType] = useState(1);
  const [price, setPrice] = useState("0");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("eth");
  const [tokenAddress, setTokenAddress] = useState("");
  const [royaltyPercent, setRoyaltyPercent] = useState("5");
  const [validUntil, setValidUntil] = useState("");
  const [exclusive, setExclusive] = useState(false);
  const [sublicensable, setSublicensable] = useState(false);
  const [customTermsURI, setCustomTermsURI] = useState("");

  const {
    createLicense,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  } = useCreateLicense();

  const parsedTokenAddress =
    paymentMode === "erc20" && isEthereumAddress(tokenAddress)
      ? (tokenAddress as `0x${string}`)
      : undefined;
  const tokenQuery = useTokenMetadata(parsedTokenAddress);
  const isBusy = isPending || isConfirming;

  const resetForm = () => {
    setLicenseType(1);
    setPrice("0");
    setPaymentMode("eth");
    setTokenAddress("");
    setRoyaltyPercent("5");
    setValidUntil("");
    setExclusive(false);
    setSublicensable(false);
    setCustomTermsURI("");
  };

  useEffect(() => {
    if (isOpen) {
      reset();
      resetForm();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isConfirmed) return;
    onSuccess?.();
    onClose();
  }, [isConfirmed, onClose, onSuccess]);

  const royaltyBps = useMemo(() => {
    const percent = Number(royaltyPercent);
    return Number.isFinite(percent) ? Math.round(percent * 100) : -1;
  }, [royaltyPercent]);

  const expiryTimestamp = validUntil
    ? Math.floor(new Date(validUntil).getTime() / 1000)
    : 0;
  const tokenInvalid =
    paymentMode === "erc20" &&
    (!parsedTokenAddress || !!tokenQuery.error || !tokenQuery.metadata);
  const customTermsMissing = licenseType === 11 && !customTermsURI.trim();
  const formInvalid =
    price.trim() === "" ||
    Number(price) < 0 ||
    royaltyBps < 0 ||
    royaltyBps > 10_000 ||
    tokenInvalid ||
    customTermsMissing ||
    (validUntil !== "" && expiryTimestamp <= Date.now() / 1000);

  const handleClose = () => {
    if (!isBusy) onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formInvalid) return;
    createLicense({
      recordId,
      licenseType,
      price,
      paymentToken:
        paymentMode === "eth" ? ZERO_ADDRESS : parsedTokenAddress!,
      paymentTokenDecimals:
        paymentMode === "eth" ? 18 : tokenQuery.metadata!.decimals,
      royaltyBps,
      validUntil: expiryTimestamp,
      exclusive,
      sublicensable,
      customTermsURI,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close license modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        disabled={isBusy}
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-license-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-black/90 shadow-2xl shadow-cyan-500/10"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/95 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 id="create-license-title" className="font-semibold text-white">
                Create license template
              </h2>
              <p className="font-mono text-xs text-white/40">
                {recordId.slice(0, 10)}…{recordId.slice(-8)}
              </p>
            </div>
          </div>
          <button
            aria-label="Close"
            disabled={isBusy}
            onClick={handleClose}
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="space-y-2">
            <Label htmlFor="license-type" className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" /> License type
            </Label>
            <select
              id="license-type"
              value={licenseType}
              onChange={(event) => setLicenseType(Number(event.target.value))}
              className="h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-sm text-white"
            >
              {Object.entries(LICENSE_TYPES)
                .filter(([value]) => Number(value) !== 0)
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="payment-mode" className="flex items-center gap-2">
                <Coins className="h-3.5 w-3.5" /> Payment
              </Label>
              <select
                id="payment-mode"
                value={paymentMode}
                onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}
                className="h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-sm text-white"
              >
                <option value="eth">Native ETH</option>
                <option value="erc20">ERC-20 token</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license-price">Price</Label>
              <div className="relative">
                <Input
                  id="license-price"
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="border-white/10 bg-white/5 pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
                  {paymentMode === "eth"
                    ? "ETH"
                    : tokenQuery.metadata?.symbol || "TOKEN"}
                </span>
              </div>
            </div>
          </div>

          {paymentMode === "erc20" && (
            <div className="space-y-2">
              <Label htmlFor="payment-token">ERC-20 token address</Label>
              <Input
                id="payment-token"
                value={tokenAddress}
                onChange={(event) => setTokenAddress(event.target.value.trim())}
                placeholder="0x…"
                className="border-white/10 bg-white/5 font-mono text-xs"
              />
              {parsedTokenAddress && tokenQuery.isLoading && (
                <p className="text-xs text-white/40">Reading token metadata…</p>
              )}
              {tokenQuery.metadata && (
                <p className="text-xs text-emerald-300">
                  {tokenQuery.metadata.symbol}, {tokenQuery.metadata.decimals} decimals
                </p>
              )}
              {tokenAddress && tokenInvalid && !tokenQuery.isLoading && (
                <p className="text-xs text-red-300">
                  Enter an ERC-20 contract exposing symbol() and decimals().
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="royalty" className="flex items-center gap-2">
                <Percent className="h-3.5 w-3.5" /> Royalty
              </Label>
              <Input
                id="royalty"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={royaltyPercent}
                onChange={(event) => setRoyaltyPercent(event.target.value)}
                className="border-white/10 bg-white/5"
              />
              <p className="text-[10px] text-white/35">{royaltyBps} basis points</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid-until" className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Template expiry
              </Label>
              <Input
                id="valid-until"
                type="datetime-local"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                className="border-white/10 bg-white/5 text-xs"
              />
              <p className="text-[10px] text-white/35">Blank means perpetual.</p>
            </div>
          </div>

          {licenseType === 11 && (
            <div className="space-y-2">
              <Label htmlFor="custom-terms">Custom terms URI</Label>
              <Input
                id="custom-terms"
                value={customTermsURI}
                onChange={(event) => setCustomTermsURI(event.target.value)}
                placeholder="ipfs://… or https://…"
                className="border-white/10 bg-white/5"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Toggle
              icon={Lock}
              label="Exclusive"
              checked={exclusive}
              onChange={setExclusive}
            />
            <Toggle
              icon={Tag}
              label="Sublicensable"
              checked={sublicensable}
              onChange={setSublicensable}
            />
          </div>

          {error && <p className="text-sm text-red-300">{error.message.slice(0, 180)}</p>}

          <Button
            type="submit"
            disabled={isBusy || formInvalid}
            className="h-11 w-full bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isPending ? "Confirm in wallet…" : "Confirming…"}
              </span>
            ) : (
              "Create license"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
    >
      <span className="flex items-center gap-2 text-sm text-white/75">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span
        className={`h-5 w-9 rounded-full p-0.5 transition ${checked ? "bg-cyan-500" : "bg-white/20"}`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`}
        />
      </span>
    </button>
  );
}
