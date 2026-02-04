"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/FileDropzone";
import { HashingProgress } from "@/components/HashingProgress";
import { VerificationResultDisplay } from "@/components/VerificationResult";
import { calculateFileHash, hashToBytes32 } from "@/lib/hash-utils";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
} from "@/lib/contracts/axiom-router";
import { toast } from "sonner";

type VerifyStep = "idle" | "hashing" | "verifying" | "result";

export default function VerifyPage() {
  const { address } = useAccount();

  // State
  const [step, setStep] = useState<VerifyStep>("idle");
  const [hashProgress, setHashProgress] = useState(0);
  const [contentHash, setContentHash] = useState<`0x${string}` | null>(null);
  const [manualHash, setManualHash] = useState("");
  const [issuerAddress, setIssuerAddress] = useState<`0x${string}`>(
    "0x0000000000000000000000000000000000000000",
  );

  // Verification query
  const {
    data: verificationData,
    isLoading: isVerifying,
    error: verificationError,
    refetch,
  } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "verify",
    args: contentHash ? [contentHash, issuerAddress] : undefined,
    query: {
      enabled: !!contentHash && step === "verifying",
    },
  });

  // Parse verification result
  // verify() returns [isValid: boolean, record: AxiomRecord]
  // where AxiomRecord = { issuer, timestamp, status, algorithm, contentHash, metadataURI }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRecord = verificationData?.[1] as any;
  const verificationResult = verificationData
    ? {
        isValid: verificationData[0],
        issuer: rawRecord?.issuer as `0x${string}`,
        timestamp: rawRecord?.timestamp
          ? BigInt(rawRecord.timestamp)
          : BigInt(0),
        uri: rawRecord?.metadataURI as string,
      }
    : undefined;

  // Handle file drop
  const handleFileSelect = useCallback(
    async (file: File) => {
      setStep("hashing");
      setHashProgress(0);
      setContentHash(null);

      try {
        const result = await calculateFileHash(file, (progress) => {
          setHashProgress(progress);
        });

        const hash = result.hash as `0x${string}`;
        setContentHash(hash);
        setStep("verifying");

        // Small delay then refetch
        setTimeout(() => {
          refetch();
        }, 100);
      } catch (error) {
        console.error("Hashing error:", error);
        toast.error("Failed to calculate hash");
        setStep("idle");
      }
    },
    [refetch],
  );

  // Handle manual hash verification
  const handleManualVerify = () => {
    if (!manualHash) {
      toast.error("Please enter a content hash");
      return;
    }

    try {
      const bytes32Hash = hashToBytes32(manualHash);
      setContentHash(bytes32Hash);
      setStep("verifying");

      setTimeout(() => {
        refetch();
      }, 100);
    } catch (error) {
      toast.error("Invalid hash format");
    }
  };

  // Update step when verification completes
  if (step === "verifying" && !isVerifying && verificationResult) {
    setStep("result");
  }

  // Reset
  const handleReset = () => {
    setStep("idle");
    setContentHash(null);
    setHashProgress(0);
    setManualHash("");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Verify Content</h1>
          <p className="text-white/60">
            Drop a file or enter a hash to check its authenticity on the
            blockchain
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Dropzone - Always visible when idle */}
          {step === "idle" && (
            <>
              <FileDropzone
                onFileSelect={handleFileSelect}
                size="large"
                className="mb-8"
              />

              {/* Manual Hash Input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-black text-white/40 text-sm">
                    or enter hash manually
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="0x..."
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={handleManualVerify}
                  className="gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  Verify
                </Button>
              </div>
            </>
          )}

          {/* Hashing Progress */}
          {step === "hashing" && <HashingProgress progress={hashProgress} />}

          {/* Verifying State */}
          {step === "verifying" && isVerifying && (
            <div className="p-12 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-axiom-cyan animate-spin" />
                <p className="text-lg text-white">Querying blockchain...</p>
                {contentHash && (
                  <p className="font-mono text-xs text-white/50 break-all max-w-md text-center">
                    {contentHash}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Verification Result */}
          {(step === "result" || (step === "verifying" && !isVerifying)) && (
            <>
              <VerificationResultDisplay
                result={verificationResult}
                isLoading={isVerifying}
                error={verificationError}
                contentHash={contentHash || undefined}
              />

              <div className="flex justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Verify Another
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
