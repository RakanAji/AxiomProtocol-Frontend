"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
  IS_AXIOM_ROUTER_CONFIGURED,
} from "@/lib/contracts/axiom-router";
import { useNetworkStatus, useRegistrationFee } from "@/hooks/useAxiomContract";
import {
  PRIVACY_FEATURE_ENABLED,
  TARGET_CHAIN_ID,
} from "@/lib/wagmi-config";

const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;

// ============================================================================
// usePrivateRegister — write (payable): privateRegister
// ============================================================================

export function usePrivateRegister() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { address } = useAccount();
  const { registrationFee } = useRegistrationFee(address);
  const { isWrongNetwork } = useNetworkStatus();

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
  } = useWaitForTransactionReceipt({ hash, chainId: TARGET_CHAIN_ID });

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
    if (!PRIVACY_FEATURE_ENABLED) {
      toast.error("Private Registration Unavailable", {
        description:
          "A production prover and approved verifier are not deployed yet.",
      });
      return;
    }
    if (!IS_AXIOM_ROUTER_CONFIGURED || isWrongNetwork) {
      toast.error("Contract Unavailable", {
        description: "Connect to the configured Sepolia deployment.",
      });
      return;
    }
    if (!zkProof || /^0x0*$/.test(zkProof)) {
      toast.error("Proof Required", {
        description: "Placeholder or empty proofs are never submitted.",
      });
      return;
    }
    if (registrationFee === undefined) {
      toast.error("Fee Unavailable", {
        description: "Could not fetch your registration fee. Please try again.",
      });
      return;
    }

    writeContract({
      ...routerConfig,
      functionName: "privateRegister",
      args: [contentHash, commitment, nullifierHash, zkProof, metadataURI],
      value: registrationFee,
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
    query: {
      enabled: PRIVACY_FEATURE_ENABLED && IS_AXIOM_ROUTER_CONFIGURED && !!recordId,
    },
  });

  let record: PrivateRecord | null = null;

  if (data) {
    const raw = data as Record<string, unknown>;
    record = {
      contentHash: raw.contentHash as `0x${string}`,
      commitment: raw.commitment as `0x${string}`,
      nullifierHash: raw.nullifierHash as `0x${string}`,
      timestamp: Number(raw.timestamp ?? 0),
      status: Number(raw.status ?? 0),
      metadataDeleted: Boolean(raw.metadataDeleted),
      metadataURI: String(raw.metadataURI ?? ""),
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
    query: {
      enabled:
        PRIVACY_FEATURE_ENABLED && IS_AXIOM_ROUTER_CONFIGURED && !!commitment,
    },
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
    query: {
      enabled:
        PRIVACY_FEATURE_ENABLED &&
        IS_AXIOM_ROUTER_CONFIGURED &&
        !!recordId &&
        !!commitment &&
        !!zkProof &&
        !/^0x0*$/.test(zkProof),
    },
  });

  return {
    isOwner: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}
