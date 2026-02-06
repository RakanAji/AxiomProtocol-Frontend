"use client";
import { useState, useCallback, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileSearch,
  User,
  CheckCircle2,
} from "lucide-react";
import { useReadContract, useAccount } from "wagmi";
import { keccak256, encodePacked } from "viem";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { FileDropzone } from "@/components/FileDropzone";
import { HashingProgress } from "@/components/HashingProgress";
import { calculateFileHash } from "@/lib/hash-utils";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useIdentity } from "@/hooks/use-axiom";

export default function VerifyPage() {
  const { address: connectedAddress } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [issuerAddress, setIssuerAddress] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isHashing, setIsHashing] = useState(false);

  // Check if issuer is valid
  const isValidIssuer = /^0x[a-fA-F0-9]{40}$/.test(issuerAddress);

  // Fetch issuer's identity
  const { identity: issuerIdentity, isLoadingIdentity } = useIdentity({
    address: isValidIssuer ? (issuerAddress as `0x${string}`) : undefined,
  });

  // Auto-fill connected wallet address as issuer
  useEffect(() => {
    if (connectedAddress && !issuerAddress) {
      setIssuerAddress(connectedAddress);
    }
  }, [connectedAddress, issuerAddress]);

  // Generate recordId from contentHash + issuer (matching contract logic)
  const recordId =
    hash && issuerAddress && isValidIssuer
      ? keccak256(
          encodePacked(
            ["bytes32", "address"],
            [hash, issuerAddress as `0x${string}`],
          ),
        )
      : null;

  // Debug logs
  useEffect(() => {
    if (hash && recordId) {
      console.log("Content Hash:", hash);
      console.log("Issuer Address:", issuerAddress);
      console.log("Generated RecordId:", recordId);
    }
  }, [hash, recordId, issuerAddress]);

  // Read from Blockchain using getRecord with computed recordId
  const {
    data: record,
    isLoading: isVerifying,
    error,
  } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getRecord",
    args: recordId ? [recordId] : undefined,
    query: { enabled: !!recordId },
  });

  // Debug: Log raw contract data
  console.log("Record Data from Contract:", record);
  console.log("Issuer Identity:", issuerIdentity);

  // Handle File Hashing
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setIsHashing(true);
    setProgress(0);
    setHash(null);

    try {
      const result = await calculateFileHash(selectedFile, (p) =>
        setProgress(p),
      );
      const calculatedHash = result.hash as `0x${string}`;
      setHash(calculatedHash);
      console.log("Calculated Content Hash:", calculatedHash);
      toast.success("Digital fingerprint calculated!");
    } catch (err) {
      toast.error("Failed to hash file");
      console.error(err);
    } finally {
      setIsHashing(false);
    }
  }, []);

  // getRecord returns struct directly, check if timestamp > 0 to determine validity
  const recordData = record as
    | {
        issuer: `0x${string}`;
        timestamp: bigint;
        status: number;
        algorithm: number;
        contentHash: `0x${string}`;
        metadataURI: string;
      }
    | undefined;

  // Valid if timestamp > 0 (record exists) and no error
  const isValid = recordData && Number(recordData.timestamp) > 0 && !error;

  // Check if issuer has identity
  const hasIdentity = issuerIdentity && Number(issuerIdentity.registeredAt) > 0;

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

        {/* Issuer Address Input */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-2xl">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Original Issuer Address
          </label>
          <input
            type="text"
            value={issuerAddress}
            onChange={(e) => setIssuerAddress(e.target.value)}
            placeholder="0x... (wallet address that registered the content)"
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-mono text-sm placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {issuerAddress && !isValidIssuer && (
            <p className="text-red-400 text-xs mt-2">
              Please enter a valid Ethereum address (0x followed by 40 hex
              characters)
            </p>
          )}
          <p className="text-gray-500 text-xs mt-2">
            Records are stored by content hash + issuer. Enter the issuer&apos;s
            wallet address to verify.
          </p>
        </Card>

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
                onClick={() => {
                  setFile(null);
                  setHash(null);
                }}
                className="text-sm text-blue-400 hover:underline"
              >
                Check another file
              </button>
            </div>
          )}
        </Card>

        {/* Results */}
        {hash && !isHashing && isValidIssuer && (
          <div className="animate-in slide-in-from-bottom-10 duration-700">
            {isVerifying || isLoadingIdentity ? (
              <div className="flex justify-center p-10">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
            ) : isValid ? (
              // VALID CARD
              <Card className="border-emerald-500/40 bg-emerald-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(16,185,129,0.6)] transition-all duration-500 hover:shadow-[0_0_100px_-10px_rgba(16,185,129,0.7)]">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-emerald-500/20 rounded-full">
                    <ShieldCheck className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Authentic Record Found
                    </h2>
                    <p className="text-emerald-200">
                      This file is registered on Axiom Protocol.
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                      {/* Issuer with Identity */}
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">
                          ISSUER
                        </span>
                        {hasIdentity ? (
                          <div className="flex items-center gap-2">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-white">
                                {issuerIdentity.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {/* Name + Badge */}
                            <span className="text-white font-semibold">
                              {issuerIdentity.name}
                            </span>
                            {issuerIdentity.isVerified && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-300">
                                  Verified
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-gray-300 break-all">
                            {recordData?.issuer}
                          </span>
                        )}
                        {/* Always show address below */}
                        {hasIdentity && (
                          <span className="block text-xs text-gray-500 font-mono mt-1">
                            {recordData?.issuer}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">
                          TIMESTAMP
                        </span>
                        <span className="text-gray-300">
                          {new Date(
                            Number(recordData?.timestamp) * 1000,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              // INVALID CARD
              <Card className="border-red-500/40 bg-red-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(239,68,68,0.6)] animate-pulse transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-red-500/20 rounded-full">
                    <ShieldAlert className="w-12 h-12 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      No Record Found
                    </h2>
                    <p className="text-red-200">
                      No record found for this file from the specified issuer.
                    </p>
                    <p className="text-red-300/60 text-sm mt-2">
                      Tip: Make sure you entered the correct issuer address.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Show prompt to enter issuer if file is hashed but no issuer */}
        {hash && !isHashing && !isValidIssuer && (
          <Card className="border-amber-500/40 bg-amber-950/40 backdrop-blur-2xl p-6 rounded-2xl border">
            <p className="text-amber-200 text-center">
              Please enter the issuer&apos;s wallet address above to verify this
              content.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
