"use client";

import { useCallback, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { AlertCircle, CheckCircle2, Loader2, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

import { FileDropzone, FilePreview } from "@/components/FileDropzone";
import { HashingProgress } from "@/components/HashingProgress";
import { WalletButton } from "@/components/WalletButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useNetworkStatus,
  useRegisterContent,
} from "@/hooks/useAxiomContract";
import { calculateFileHash } from "@/lib/hash-utils";

type RegistrationStep = "upload" | "hashing" | "metadata" | "confirm";

export default function RegisterPage() {
  const { isConnected } = useAccount();
  const {
    isWrongNetwork,
    isContractConfigured,
    configurationError,
  } = useNetworkStatus();
  const {
    register,
    registrationFee,
    isLoadingFee,
    isWritePending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  } = useRegisterContent();

  const [step, setStep] = useState<RegistrationStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashProgress, setHashProgress] = useState(0);
  const [contentHash, setContentHash] = useState<`0x${string}` | null>(null);
  const [metadata, setMetadata] = useState({ title: "", description: "" });

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setStep("hashing");
    setHashProgress(0);
    setContentHash(null);

    try {
      const result = await calculateFileHash(file, setHashProgress);
      setContentHash(result.hash as `0x${string}`);
      setStep("metadata");
      toast.success("Digital fingerprint calculated locally");
    } catch (hashError) {
      console.error("Hashing error:", hashError);
      toast.error("Failed to calculate the file hash");
      setStep("upload");
    }
  }, []);

  const handleRegister = () => {
    if (!contentHash || !selectedFile) return;
    const metadataURI = JSON.stringify({
      title: metadata.title.trim(),
      description: metadata.description.trim(),
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
    });
    register(contentHash, metadataURI);
    setStep("confirm");
  };

  const handleReset = () => {
    reset();
    setStep("upload");
    setSelectedFile(null);
    setHashProgress(0);
    setContentHash(null);
    setMetadata({ title: "", description: "" });
  };

  const feeLabel = isLoadingFee
    ? "Loading your fee…"
    : registrationFee === undefined
      ? "Fee unavailable"
      : registrationFee === BigInt(0)
        ? "Free for this wallet"
        : `${formatEther(registrationFee)} ETH`;

  const isBusy = isWritePending || isConfirming;
  const canRegister =
    !!contentHash &&
    isConnected &&
    !isWrongNetwork &&
    isContractConfigured &&
    registrationFee !== undefined &&
    !isLoadingFee &&
    !isBusy;

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="text-center">
          <h1 className="mb-3 text-4xl font-bold text-white">Register Content</h1>
          <p className="mx-auto max-w-xl text-white/60">
            Hash a file locally, then anchor its fingerprint and optional
            metadata to your wallet on Sepolia.
          </p>
        </div>

        <div className="mx-auto grid max-w-md grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-2.5 text-sm font-medium text-white">
            <Shield className="h-4 w-4" /> Standard
          </button>
          <button
            type="button"
            disabled
            title="A production prover and verifier are not deployed yet"
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white/30"
          >
            <Lock className="h-4 w-4" /> Private (unavailable)
          </button>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 text-sm text-amber-100/75">
          Private registration is intentionally disabled until a production
          circuit, prover, and approved verifier are deployed. This interface
          never submits placeholder proofs.
        </div>

        {!isContractConfigured && (
          <div className="flex gap-3 rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{configurationError}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-black/40 backdrop-blur-md lg:row-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" /> Content file
              </CardTitle>
              <CardDescription>
                The browser computes SHA-256; the file itself is not uploaded.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "upload" && (
                <FileDropzone onFileSelect={handleFileSelect} size="large" />
              )}
              {step === "hashing" && selectedFile && (
                <HashingProgress progress={hashProgress} fileName={selectedFile.name} />
              )}
              {(step === "metadata" || step === "confirm") && selectedFile && (
                <FilePreview
                  file={selectedFile}
                  hash={contentHash || undefined}
                  onRemove={isConfirmed ? undefined : handleReset}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Optional metadata</CardTitle>
              <CardDescription>
                Stored as the record metadata string; do not include secrets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, title: event.target.value }))
                  }
                  disabled={!contentHash || isBusy || isConfirmed}
                  placeholder="Original artwork #001"
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={metadata.description}
                  onChange={(event) =>
                    setMetadata((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  disabled={!contentHash || isBusy || isConfirmed}
                  placeholder="Describe this content"
                  className="border-white/10 bg-white/5"
                />
              </div>
              {contentHash && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="mb-1 text-xs text-white/50">SHA-256 fingerprint</p>
                  <p className="break-all font-mono text-xs text-cyan-300">
                    {contentHash}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-md">
            <CardContent className="space-y-4 pt-6">
              {isConfirmed ? (
                <div className="py-3 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-emerald-300">
                    Registration confirmed
                  </h2>
                  <p className="mt-2 text-sm text-white/50">
                    The on-chain record is now linked to your wallet. Its status
                    can later change through protocol actions such as revocation.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={handleReset}>
                    Register another
                  </Button>
                </div>
              ) : !isConnected ? (
                <div className="py-3 text-center">
                  <p className="mb-4 text-sm text-white/60">
                    Connect a wallet to load its exact registration fee.
                  </p>
                  <WalletButton />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <span className="text-white/50">Registration fee</span>
                    <span className="font-medium text-white">{feeLabel}</span>
                  </div>
                  <Button
                    size="xl"
                    className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-purple-500"
                    disabled={!canRegister}
                    onClick={handleRegister}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {isWritePending ? "Confirm in wallet…" : "Confirming…"}
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" /> Register fingerprint
                      </>
                    )}
                  </Button>
                </>
              )}

              {isWrongNetwork && isConnected && (
                <p className="text-center text-sm text-red-300">
                  Switch to Sepolia before submitting.
                </p>
              )}
              {error && !isBusy && (
                <p className="break-words text-sm text-red-300">
                  {error.message.slice(0, 180)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
