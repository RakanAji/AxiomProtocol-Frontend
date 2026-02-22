"use client";

import { useEffect, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
} from "@/lib/contracts/axiom-router";
import { useProtocolFee } from "@/hooks/useAxiomContract";

const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
} as const;

// ============================================================================
// usePrivateRegister — write (payable): privateRegister
// ============================================================================

export function usePrivateRegister() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { baseFee } = useProtocolFee();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash) setTxHash(hash);
  }, [hash]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success("Private Registration Complete!", {
        description: `Tx: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });
    }
  }, [isConfirmed, txHash]);

  useEffect(() => {
    if (writeError) {
      toast.error("Transaction Failed", {
        description: writeError.message.slice(0, 120),
      });
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      toast.error("Confirmation Failed", {
        description: confirmError.message.slice(0, 120),
      });
    }
  }, [confirmError]);

  const privateRegister = (
    contentHash: `0x${string}`,
    commitment: `0x${string}`,
    nullifierHash: `0x${string}`,
    zkProof: `0x${string}`,
    metadataURI: string,
  ) => {
    if (!baseFee) {
      toast.error("Fee Unavailable", {
        description: "Could not fetch protocol fee. Please try again.",
      });
      return;
    }

    writeContract({
      ...routerConfig,
      functionName: "privateRegister",
      args: [contentHash, commitment, nullifierHash, zkProof, metadataURI],
      value: baseFee,
    });
  };

  return {
    privateRegister,
    txHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    reset,
  };
}

// ============================================================================
// usePrivateRecord — read: getPrivateRecord(bytes32)
// ============================================================================

export interface PrivateRecord {
  contentHash: `0x${string}`;
  commitment: `0x${string}`;
  nullifierHash: `0x${string}`;
  timestamp: number;
  status: number;
  metadataDeleted: boolean;
  metadataURI: string;
}

export function usePrivateRecord(recordId: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    ...routerConfig,
    functionName: "getPrivateRecord",
    args: recordId ? [recordId] : undefined,
    query: { enabled: !!recordId },
  });

  let record: PrivateRecord | null = null;

  if (data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = data as any;
    record = {
      contentHash: raw.contentHash,
      commitment: raw.commitment,
      nullifierHash: raw.nullifierHash,
      timestamp: Number(raw.timestamp ?? 0),
      status: Number(raw.status ?? 0),
      metadataDeleted: Boolean(raw.metadataDeleted),
      metadataURI: raw.metadataURI ?? "",
    };
  }

  return { record, isLoading, error };
}

// ============================================================================
// useRecordsByCommitment — read: getRecordsByCommitment(bytes32)
// ============================================================================

export function useRecordsByCommitment(commitment: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...routerConfig,
    functionName: "getRecordsByCommitment",
    args: commitment ? [commitment] : undefined,
    query: { enabled: !!commitment },
  });

  const recordIds = (data as `0x${string}`[]) ?? [];

  return { recordIds, isLoading, error, refetch };
}

// ============================================================================
// useVerifyOwnership — read: verifyOwnership(bytes32, bytes32, bytes)
// ============================================================================

export function useVerifyOwnership(
  recordId: `0x${string}` | undefined,
  commitment: `0x${string}` | undefined,
  zkProof: `0x${string}` | undefined,
) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...routerConfig,
    functionName: "verifyOwnership",
    args:
      recordId && commitment && zkProof
        ? [recordId, commitment, zkProof]
        : undefined,
    query: { enabled: !!recordId && !!commitment && !!zkProof },
  });

  return {
    isOwner: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}
