"use client";
import { useState, useCallback, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileSearch,
  User,
  CheckCircle2,
  Flag,
  AlertTriangle,
  X,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useIdentity } from "@/hooks/useAxiomContract";
import { useDisputeContent } from "@/hooks/useAxiomContract";

// Status Enum: 0 = Active, 1 = Revoked, 2 = Disputed
const STATUS = {
  ACTIVE: 0,
  REVOKED: 1,
  DISPUTED: 2,
} as const;

export default function VerifyPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [issuerAddress, setIssuerAddress] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isHashing, setIsHashing] = useState(false);

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  // Dispute hook
  const {
    dispute,
    isPending: isDisputePending,
    isConfirming: isDisputeConfirming,
    isConfirmed: isDisputeConfirmed,
    error: disputeError,
    reset: resetDispute,
  } = useDisputeContent();

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
    refetch: refetchRecord,
  } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getRecord",
    args: recordId ? [recordId] : undefined,
    query: { enabled: !!recordId },
  });

  // Handle dispute success
  useEffect(() => {
    if (isDisputeConfirmed) {
      toast.success("Dispute Filed!", {
        description: "Your dispute has been submitted to the protocol.",
      });
      setShowDisputeModal(false);
      setDisputeReason("");
      resetDispute();
      refetchRecord();
    }
  }, [isDisputeConfirmed, resetDispute, refetchRecord]);

  // Handle dispute error
  useEffect(() => {
    if (disputeError) {
      toast.error("Dispute Failed", {
        description: disputeError.message.slice(0, 100),
      });
    }
  }, [disputeError]);

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

  const handleDispute = async () => {
    if (!recordId || !disputeReason.trim()) {
      toast.error("Please provide a reason for the dispute");
      return;
    }
    await dispute(recordId, disputeReason);
  };

  // Parse record data
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

  // Record exists if timestamp > 0
  const recordExists = recordData && Number(recordData.timestamp) > 0;
  // Get status (0 = Active, 1 = Revoked, 2 = Disputed)
  const status = recordExists ? recordData.status : -1;

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
            ) : recordExists && status === STATUS.ACTIVE ? (
              // ========== ACTIVE (GREEN) CARD ==========
              <Card className="border-emerald-500/40 bg-emerald-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(16,185,129,0.6)] transition-all duration-500 hover:shadow-[0_0_100px_-10px_rgba(16,185,129,0.7)]">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-emerald-500/20 rounded-full">
                    <ShieldCheck className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          Authentic Record Found
                        </h2>
                        <p className="text-emerald-200">
                          This file is registered on Axiom Protocol.
                        </p>
                      </div>
                      {/* Report/Dispute Button */}
                      {isConnected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDisputeModal(true)}
                          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                        >
                          <Flag className="w-3 h-3 mr-1" />
                          Report
                        </Button>
                      )}
                    </div>
                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">
                          ISSUER
                        </span>
                        {hasIdentity ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-white">
                                {issuerIdentity.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
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
            ) : recordExists && status === STATUS.REVOKED ? (
              // ========== REVOKED (GRAY/RED) CARD ==========
              <Card className="border-slate-500/40 bg-slate-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(100,116,139,0.6)] transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-slate-500/20 rounded-full">
                    <ShieldAlert className="w-12 h-12 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      REVOKED RECORD
                    </h2>
                    <p className="text-slate-300">
                      The issuer has cancelled this record.
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">
                          ISSUER
                        </span>
                        {hasIdentity ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {issuerIdentity!.name}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-gray-300 break-all">
                            {recordData?.issuer}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">
                          ORIGINAL TIMESTAMP
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
            ) : recordExists && status === STATUS.DISPUTED ? (
              // ========== DISPUTED (AMBER) CARD ==========
              <Card className="border-amber-500/40 bg-amber-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(245,158,11,0.6)] transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-amber-500/20 rounded-full">
                    <AlertTriangle className="w-12 h-12 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      COMMUNITY DISPUTE
                    </h2>
                    <p className="text-amber-200">
                      This record has been flagged by the community.
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">
                          ISSUER
                        </span>
                        {hasIdentity ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {issuerIdentity!.name}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-gray-300 break-all">
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
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-amber-200 text-xs">
                        ⚠️ Exercise caution. This content is under review by
                        protocol operators.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              // ========== NOT FOUND (RED) CARD ==========
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

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="border-amber-500/40 bg-black/90 backdrop-blur-2xl p-6 rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flag className="w-5 h-5 text-amber-400" />
                  Report Content
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDisputeModal(false);
                    setDisputeReason("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Flag this content for review by protocol operators. Please
                provide a reason for your dispute.
              </p>
              <Input
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Reason for dispute (e.g., copyright infringement, misleading content)"
                className="bg-white/5 border-white/10 mb-4"
                disabled={isDisputePending || isDisputeConfirming}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDisputeModal(false);
                    setDisputeReason("");
                  }}
                  disabled={isDisputePending || isDisputeConfirming}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={handleDispute}
                  disabled={
                    !disputeReason.trim() ||
                    isDisputePending ||
                    isDisputeConfirming
                  }
                >
                  {isDisputePending || isDisputeConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {isDisputePending ? "Confirm..." : "Submitting..."}
                    </>
                  ) : (
                    "Submit Dispute"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
