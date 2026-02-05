"use client";
import { useState, useCallback } from "react";
import { ShieldCheck, ShieldAlert, Loader2, FileSearch } from "lucide-react";
import { useReadContract } from "wagmi";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { FileDropzone } from "@/components/FileDropzone";
import { HashingProgress } from "@/components/HashingProgress";
import { calculateFileHash } from "@/lib/hash-utils";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [progress, setProgress] = useState(0);
  const [isHashing, setIsHashing] = useState(false);

  // 1. Read from Blockchain
  const { data: record, isLoading: isVerifying } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "verify",
    // Use a dummy address for _claimedIssuer as we are just checking existence first
    args: hash
      ? [hash, "0x0000000000000000000000000000000000000000"]
      : undefined,
    query: { enabled: !!hash },
  });

  // 2. Handle File Hashing
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setIsHashing(true);
    setProgress(0);
    setHash(null);

    try {
      const result = await calculateFileHash(selectedFile, (p) =>
        setProgress(p),
      );
      setHash(result.hash as `0x${string}`);
      toast.success("Digital fingerprint calculated!");
    } catch (err) {
      toast.error("Failed to hash file");
      console.error(err);
    } finally {
      setIsHashing(false);
    }
  }, []);

  const isValid = record?.[0]; // verify() returns [bool isValid, struct Record]
  const recordData = record?.[1];

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white">Verify Content</h1>
          <p className="text-white/60">
            Drop a file to check its authenticity on the blockchain
          </p>
        </div>

        {/* Input Zone */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
          {!file ? (
            <FileDropzone onFileSelect={handleFileSelect} size="large" />
          ) : isHashing ? (
            <HashingProgress progress={progress} fileName={file.name} />
          ) : (
            <div className="text-center space-y-4 animate-in fade-in">
              <FileSearch className="w-16 h-16 text-blue-500 mx-auto" />
              <p className="text-xl text-white font-mono">{file.name}</p>
              <p className="text-xs text-gray-500 font-mono break-all px-10">
                {hash}
              </p>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-blue-400 hover:underline"
              >
                Check another file
              </button>
            </div>
          )}
        </Card>

        {/* Results */}
        {hash && !isHashing && (
          <div className="animate-in slide-in-from-bottom-10 duration-700">
            {isVerifying ? (
              <div className="flex justify-center p-10">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
            ) : isValid ? (
              // VALID CARD
              <Card className="border-emerald-500/50 bg-emerald-950/30 backdrop-blur-xl p-8 rounded-3xl border-2 shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-emerald-500/20 rounded-full">
                    <ShieldCheck className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Authentic Record Found
                    </h2>
                    <p className="text-emerald-200">
                      This file is registered on Axiom Protocol.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-mono text-gray-300">
                      <div>
                        <span className="block text-gray-500 text-xs">
                          ISSUER
                        </span>
                        {recordData && "issuer" in recordData
                          ? String(recordData.issuer)
                          : "Unknown"}
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">
                          TIMESTAMP
                        </span>
                        {recordData && "timestamp" in recordData
                          ? new Date(
                              Number(recordData.timestamp) * 1000,
                            ).toLocaleString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              // INVALID CARD
              <Card className="border-red-500/50 bg-red-950/30 backdrop-blur-xl p-8 rounded-3xl border-2 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-red-500/20 rounded-full">
                    <ShieldAlert className="w-12 h-12 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      No Record Found
                    </h2>
                    <p className="text-red-200">
                      This file has not been registered or has been modified.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
