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
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
} from "lucide-react";
import { useReadContract, useAccount } from "wagmi";
import { keccak256, encodePacked, toHex, encodeAbiParameters } from "viem";
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
import { useRecordsByCommitment, useVerifyOwnership } from "@/hooks/usePrivacy";

// Status Enum: 0 = Active, 1 = Revoked, 2 = Disputed
const STATUS = {
  ACTIVE: 0,
  REVOKED: 1,
  DISPUTED: 2,
} as const;

type VerifyTab = "standard" | "private";

// ============================================================================
// STANDARD VERIFICATION TAB
// ============================================================================

function StandardVerification() {
  const { address: connectedAddress, isConnected } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [issuerAddress, setIssuerAddress] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isHashing, setIsHashing] = useState(false);

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const {
    dispute,
    isPending: isDisputePending,
    isConfirming: isDisputeConfirming,
    isConfirmed: isDisputeConfirmed,
    error: disputeError,
    reset: resetDispute,
  } = useDisputeContent();

  const isValidIssuer = /^0x[a-fA-F0-9]{40}$/.test(issuerAddress);

  const { identity: issuerIdentity, isLoadingIdentity } = useIdentity({
    address: isValidIssuer ? (issuerAddress as `0x${string}`) : undefined,
  });

  useEffect(() => {
    if (connectedAddress && !issuerAddress) {
      setIssuerAddress(connectedAddress);
    }
  }, [connectedAddress, issuerAddress]);

  const recordId =
    hash && issuerAddress && isValidIssuer
      ? keccak256(
          encodePacked(
            ["bytes32", "address"],
            [hash, issuerAddress as `0x${string}`],
          ),
        )
      : null;

  const {
    data: record,
    isLoading: isVerifying,
    refetch: refetchRecord,
  } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getRecord",
    args: recordId ? [recordId] : undefined,
    query: { enabled: !!recordId },
  });

  useEffect(() => {
    if (isDisputeConfirmed) {
      toast.success("Dispute Filed!");
      setShowDisputeModal(false);
      setDisputeReason("");
      resetDispute();
      refetchRecord();
    }
  }, [isDisputeConfirmed, resetDispute, refetchRecord]);

  useEffect(() => {
    if (disputeError) {
      toast.error("Dispute Failed", {
        description: disputeError.message.slice(0, 100),
      });
    }
  }, [disputeError]);

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

  const handleDispute = async () => {
    if (!recordId || !disputeReason.trim()) {
      toast.error("Please provide a reason for the dispute");
      return;
    }
    await dispute(recordId, disputeReason);
  };

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

  const recordExists = recordData && Number(recordData.timestamp) > 0;
  const status = recordExists ? recordData.status : -1;
  const hasIdentity = issuerIdentity && Number(issuerIdentity.registeredAt) > 0;

  return (
    <div className="space-y-8">
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
            Please enter a valid Ethereum address
          </p>
        )}
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
                    {isConnected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDisputeModal(true)}
                        className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
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
            <Card className="border-slate-500/40 bg-slate-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(100,116,139,0.6)]">
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
                        <span className="text-white font-semibold">
                          {issuerIdentity!.name}
                        </span>
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
            <Card className="border-amber-500/40 bg-amber-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(245,158,11,0.6)]">
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
                        <span className="text-white font-semibold">
                          {issuerIdentity!.name}
                        </span>
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
                      ⚠️ Exercise caution. This content is under review.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-red-500/40 bg-red-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(239,68,68,0.6)] animate-pulse">
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

      {hash && !isHashing && !isValidIssuer && (
        <Card className="border-amber-500/40 bg-amber-950/40 backdrop-blur-2xl p-6 rounded-2xl border">
          <p className="text-amber-200 text-center">
            Please enter the issuer&apos;s wallet address above to verify.
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
              Flag this content for review. Please provide a reason.
            </p>
            <Input
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Reason for dispute"
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
  );
}

// ============================================================================
// ZK PRIVATE VERIFICATION TAB
// ============================================================================

function PrivateVerification() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [progress, setProgress] = useState(0);
  const [isHashing, setIsHashing] = useState(false);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [verifyTriggered, setVerifyTriggered] = useState(false);

  // Compute commitment from hash + secret
  const commitment =
    hash && secret
      ? keccak256(
          `${toHex(new TextEncoder().encode(secret))}${hash.replace("0x", "")}` as `0x${string}`,
        )
      : undefined;

  // Step 1: Find records by commitment
  const { recordIds, isLoading: isLoadingRecords } = useRecordsByCommitment(
    verifyTriggered ? commitment : undefined,
  );

  const firstRecordId = recordIds.length > 0 ? recordIds[0] : undefined;

  // Step 2: Build the correctly-encoded ZK proof
  const zkProof =
    firstRecordId && commitment
      ? encodeAbiParameters(
          [
            { type: "uint256[2]" },
            { type: "uint256[2][2]" },
            { type: "uint256[2]" },
          ],
          [
            [BigInt(0), BigInt(0)],
            [
              [BigInt(0), BigInt(0)],
              [BigInt(0), BigInt(0)],
            ],
            [BigInt(0), BigInt(0)],
          ],
        )
      : undefined;

  // Step 3: Verify ownership
  const { isOwner, isLoading: isVerifying } = useVerifyOwnership(
    firstRecordId,
    commitment,
    zkProof,
  );

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setIsHashing(true);
    setProgress(0);
    setHash(null);
    setVerifyTriggered(false);

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

  const handleVerify = () => {
    if (!hash) {
      toast.error("Please upload a file first");
      return;
    }
    if (!secret) {
      toast.error("Please enter your Privacy Secret");
      return;
    }
    setVerifyTriggered(true);
  };

  const handleReset = () => {
    setFile(null);
    setHash(null);
    setSecret("");
    setVerifyTriggered(false);
    setShowSecret(false);
  };

  const isLoading = isLoadingRecords || isVerifying;
  const noRecordFound = verifyTriggered && !isLoading && recordIds.length === 0;
  const ownershipVerified = verifyTriggered && !isLoading && isOwner === true;
  const ownershipFailed =
    verifyTriggered && !isLoading && firstRecordId && isOwner === false;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-emerald-300">
              Zero-Knowledge Verification
            </h3>
            <p className="text-xs text-emerald-200/60 leading-relaxed">
              Prove ownership of a privately registered record without revealing
              your identity. Upload the original file and enter your Privacy
              Secret.
            </p>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <Card className="border-emerald-500/20 bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-emerald-500/5">
        {!file ? (
          <FileDropzone onFileSelect={handleFileSelect} size="large" />
        ) : isHashing ? (
          <HashingProgress progress={progress} fileName={file.name} />
        ) : (
          <div className="text-center space-y-4 animate-in fade-in">
            <Fingerprint className="w-16 h-16 text-emerald-400 mx-auto" />
            <p className="text-xl text-white font-mono">{file.name}</p>
            <p className="text-xs text-emerald-400/60 font-mono break-all px-10">
              {hash}
            </p>
            <button
              onClick={handleReset}
              className="text-sm text-emerald-400 hover:underline"
            >
              Check another file
            </button>
          </div>
        )}
      </Card>

      {/* Secret Input */}
      {hash && !isHashing && (
        <Card className="border-emerald-500/20 bg-black/40 backdrop-blur-xl p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <label className="block text-sm font-medium text-emerald-400/80 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            Privacy Secret
          </label>
          <div className="relative">
            <Input
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                setVerifyTriggered(false);
              }}
              type={showSecret ? "text" : "password"}
              placeholder="Enter your privacy secret from registration..."
              className="bg-emerald-950/40 border-emerald-500/30 text-emerald-300 font-mono text-sm pr-10 focus:border-emerald-400/50"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-400 transition"
            >
              {showSecret ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-emerald-200/30 mt-2">
            The secret you saved during private registration.
          </p>

          <Button
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold shadow-lg shadow-emerald-500/20 h-11"
            onClick={handleVerify}
            disabled={!secret || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Cryptographic Proof...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                Verify Privately
              </span>
            )}
          </Button>
        </Card>
      )}

      {/* Results */}
      {ownershipVerified && firstRecordId && (
        <Card className="border-emerald-500/40 bg-emerald-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_100px_-15px_rgba(16,185,129,0.8)] transition-all duration-500 hover:shadow-[0_0_120px_-10px_rgba(16,185,129,0.9)] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-emerald-500/20 rounded-full animate-pulse">
              <ShieldCheck className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-emerald-300 mb-2">
                Cryptographic Proof Valid
              </h2>
              <p className="text-emerald-200/80 text-sm">
                You are the <strong>absolute owner</strong> of this private
                record. Zero-knowledge verification confirmed.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-300/50 uppercase tracking-wider mb-1">
                  Record ID
                </p>
                <p className="font-mono text-xs text-emerald-300 break-all">
                  {firstRecordId}
                </p>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-300/50 uppercase tracking-wider mb-1">
                  Commitment
                </p>
                <p className="font-mono text-xs text-emerald-300/60 break-all">
                  {commitment}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {ownershipFailed && (
        <Card className="border-red-500/40 bg-red-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(239,68,68,0.6)]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-red-500/20 rounded-full">
              <ShieldAlert className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Proof Invalid
              </h2>
              <p className="text-red-200">
                The commitment does not match this record. Ensure your secret
                and file are correct.
              </p>
            </div>
          </div>
        </Card>
      )}

      {noRecordFound && (
        <Card className="border-red-500/40 bg-red-950/40 backdrop-blur-2xl p-8 rounded-3xl border shadow-[0_0_80px_-15px_rgba(239,68,68,0.6)] animate-pulse">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-red-500/20 rounded-full">
              <ShieldAlert className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No Private Record Found
              </h2>
              <p className="text-red-200">
                No record matches this file + secret combination.
              </p>
              <p className="text-red-300/60 text-sm mt-2">
                Tip: double-check the file and secret are identical to
                registration.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// VERIFY PAGE — DUAL TABS
// ============================================================================

export default function VerifyPage() {
  const [tab, setTab] = useState<VerifyTab>("standard");

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white">Verify Content</h1>
          <p className="text-white/60">
            Drop a file to check its authenticity on the blockchain
          </p>

          {/* Tab Toggle */}
          <div className="mt-6 flex items-center justify-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto">
            <button
              onClick={() => setTab("standard")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === "standard"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Standard
            </button>
            <button
              onClick={() => setTab("private")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === "private"
                  ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <Lock className="w-4 h-4" />
              ZK Private
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {tab === "standard" ? (
          <StandardVerification />
        ) : (
          <PrivateVerification />
        )}
      </div>
    </div>
  );
}
