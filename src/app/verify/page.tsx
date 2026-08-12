"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Flag,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { toast } from "sonner";

import { DisputeModal } from "@/components/DisputeModal";
import { FileDropzone } from "@/components/FileDropzone";
import { HashingProgress } from "@/components/HashingProgress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useIdentity } from "@/hooks/useAxiomContract";
import {
  contentStatusLabel,
  deriveRecordId,
  isBytes32,
  isEthereumAddress,
  shortAddress,
} from "@/lib/axiom-domain";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
  IS_AXIOM_ROUTER_CONFIGURED,
  ROUTER_CONFIGURATION_ERROR,
} from "@/lib/contracts/axiom-router";
import { calculateFileHash } from "@/lib/hash-utils";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

interface RecordData {
  issuer: `0x${string}`;
  timestamp: bigint;
  status: number;
  algorithm: number;
  contentHash: `0x${string}`;
  metadataURI: string;
}

function parseRecord(raw: unknown): RecordData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as Record<string, unknown>;
  if (!value.issuer || !value.contentHash) return undefined;
  return {
    issuer: value.issuer as `0x${string}`,
    timestamp: (value.timestamp as bigint | undefined) ?? BigInt(0),
    status: Number(value.status ?? 0),
    algorithm: Number(value.algorithm ?? 0),
    contentHash: value.contentHash as `0x${string}`,
    metadataURI: String(value.metadataURI ?? ""),
  };
}

export default function VerifyPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState("");
  const [issuerInput, setIssuerInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [isHashing, setIsHashing] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryHash = params.get("hash")?.trim() || "";
    const queryIssuer = params.get("issuer")?.trim() || "";
    if (queryHash && isBytes32(queryHash)) setHashInput(queryHash);
    if (queryIssuer && isEthereumAddress(queryIssuer)) setIssuerInput(queryIssuer);
  }, []);

  useEffect(() => {
    if (connectedAddress && !issuerInput) setIssuerInput(connectedAddress);
  }, [connectedAddress, issuerInput]);

  const contentHash = isBytes32(hashInput) ? hashInput : undefined;
  const issuer = isEthereumAddress(issuerInput)
    ? (issuerInput as `0x${string}`)
    : undefined;
  const recordId = contentHash && issuer ? deriveRecordId(contentHash, issuer) : undefined;

  const recordQuery = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    chainId: TARGET_CHAIN_ID,
    functionName: "getRecord",
    args: recordId ? [recordId] : undefined,
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED && !!recordId,
      retry: 1,
      staleTime: 10_000,
    },
  });
  const record = parseRecord(recordQuery.data);
  const recordExists = !!record && record.timestamp > BigInt(0);
  const identityQuery = useIdentity({
    address: recordExists ? record.issuer : undefined,
  });

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setHashInput("");
    setProgress(0);
    setIsHashing(true);
    try {
      const result = await calculateFileHash(selectedFile, setProgress);
      setHashInput(result.hash);
      toast.success("Digital fingerprint calculated locally");
    } catch (error) {
      console.error("Hashing error:", error);
      toast.error("Failed to hash the file");
      setFile(null);
    } finally {
      setIsHashing(false);
    }
  }, []);

  const clearFile = () => {
    setFile(null);
    setHashInput("");
    setProgress(0);
  };

  const status = recordExists ? record.status : undefined;

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold text-white">Verify Registration</h1>
          <p className="text-white/60">
            Match a SHA-256 fingerprint and issuer to its canonical on-chain
            record ID.
          </p>
        </div>

        {!IS_AXIOM_ROUTER_CONFIGURED && (
          <Notice tone="error" message={ROUTER_CONFIGURATION_ERROR || "Router is not configured"} />
        )}

        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 py-2.5 text-sm text-white">
            <ShieldCheck className="h-4 w-4" /> Standard
          </button>
          <button
            type="button"
            disabled
            title="A production proof generator is not available"
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/30"
          >
            <Lock className="h-4 w-4" /> ZK Private (unavailable)
          </button>
        </div>

        <Card className="space-y-3 rounded-2xl border-white/10 bg-black/40 p-6">
          <label htmlFor="issuer" className="block text-sm font-medium text-white/60">
            <User className="mr-2 inline h-4 w-4" /> Registering wallet
          </label>
          <Input
            id="issuer"
            value={issuerInput}
            onChange={(event) => setIssuerInput(event.target.value.trim())}
            placeholder="0x…"
            className="border-white/10 bg-black/50 font-mono"
          />
          {issuerInput && !issuer && (
            <p className="text-xs text-red-300">Enter a valid Ethereum address.</p>
          )}
        </Card>

        <Card className="rounded-3xl border-white/10 bg-black/40 p-7">
          {!file ? (
            <FileDropzone onFileSelect={handleFileSelect} size="large" />
          ) : isHashing ? (
            <HashingProgress progress={progress} fileName={file.name} />
          ) : (
            <div className="space-y-3 text-center">
              <FileSearch className="mx-auto h-14 w-14 text-cyan-400" />
              <p className="text-lg text-white">{file.name}</p>
              <button onClick={clearFile} className="text-sm text-cyan-400 hover:underline">
                Choose another file
              </button>
            </div>
          )}
          <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
            <label htmlFor="content-hash" className="text-xs text-white/50">
              Or enter a SHA-256 hash
            </label>
            <Input
              id="content-hash"
              value={hashInput}
              onChange={(event) => {
                setFile(null);
                setHashInput(event.target.value.trim());
              }}
              placeholder="0x followed by 64 hexadecimal characters"
              className="border-white/10 bg-white/5 font-mono text-xs"
            />
            {hashInput && !contentHash && (
              <p className="text-xs text-red-300">Enter a valid bytes32 hash.</p>
            )}
          </div>
        </Card>

        {recordId && (
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] text-white/40">
            Canonical record ID: {recordId}
          </div>
        )}

        {recordQuery.isLoading || identityQuery.isLoadingIdentity ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
          </div>
        ) : recordQuery.error ? (
          <Notice
            tone="error"
            message={`Record query failed: ${recordQuery.error.message.slice(0, 180)}`}
          />
        ) : recordId && recordExists ? (
          <Card
            className={`rounded-3xl border p-7 ${status === 0 ? "border-emerald-500/40 bg-emerald-950/30" : status === 1 ? "border-slate-500/40 bg-slate-950/30" : "border-amber-500/40 bg-amber-950/30"}`}
          >
            <div className="flex items-start gap-5">
              <div className="rounded-full bg-white/10 p-3">
                {status === 0 ? (
                  <ShieldCheck className="h-10 w-10 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-10 w-10 text-amber-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Matching registration found
                    </h2>
                    <p className="mt-1 text-sm text-white/60">
                      Current status: {contentStatusLabel(status!)}
                    </p>
                  </div>
                  {isConnected && status === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDisputeModal(true)}
                      className="border-amber-500/40 text-amber-300"
                    >
                      <Flag className="mr-1 h-3.5 w-3.5" /> Report
                    </Button>
                  )}
                </div>
                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase text-white/35">Issuer</dt>
                    <dd className="mt-1 text-white/75">
                      {identityQuery.identity?.registeredAt
                        ? `${identityQuery.identity.name} (${shortAddress(record!.issuer)})`
                        : record!.issuer}
                      {identityQuery.identity?.isVerified && (
                        <CheckCircle2 className="ml-2 inline h-4 w-4 text-emerald-400" />
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-white/35">Registered</dt>
                    <dd className="mt-1 text-white/75">
                      {new Date(Number(record!.timestamp) * 1000).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <p className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-white/45">
                  This confirms that the wallet registered this fingerprint and
                  shows its current protocol status. It does not independently
                  prove authorship, legality, or the truth of metadata.
                </p>
              </div>
            </div>
          </Card>
        ) : recordId ? (
          <Notice
            tone="warning"
            message="No registration matches this exact fingerprint and issuer. Check both values before drawing a conclusion."
          />
        ) : null}
      </div>

      {recordId && showDisputeModal && (
        <DisputeModal
          isOpen
          recordId={recordId}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={() => void recordQuery.refetch()}
        />
      )}
    </div>
  );
}

function Notice({
  tone,
  message,
}: {
  tone: "error" | "warning";
  message: string;
}) {
  return (
    <Card
      className={`rounded-2xl border p-5 ${tone === "error" ? "border-red-500/30 bg-red-950/30 text-red-200" : "border-amber-500/30 bg-amber-950/30 text-amber-100"}`}
    >
      <p className="flex items-start gap-3 text-sm">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {message}
      </p>
    </Card>
  );
}
