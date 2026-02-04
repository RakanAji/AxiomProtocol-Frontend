"use client";

/**
 * Axiom Protocol Custom Hooks
 *
 * Business logic hooks for specific contract interactions.
 * Separated from useAxiomContract.ts for separation of concerns.
 */

import { useState, useEffect, useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";

import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
} from "@/lib/contracts/axiom-router";
import {
  AxiomRecord,
  IdentityInfo,
  VerificationResult,
  parseAxiomRecord,
  parseIdentityInfo,
} from "@/lib/contracts/types";

// ============================================================================
// TYPES
// ============================================================================

export type TransactionStatus =
  | "idle"
  | "pending"
  | "confirming"
  | "success"
  | "error";

export interface UseAxiomRegisterReturn {
  /** Register content with hash and metadata URI */
  register: (hash: `0x${string}`, metadataURI: string) => void;
  /** Current transaction status */
  status: TransactionStatus;
  /** Transaction hash if available */
  txHash: `0x${string}` | undefined;
  /** Error if any */
  error: Error | null;
  /** Whether transaction is in flight */
  isPending: boolean;
  /** Whether waiting for on-chain confirmation */
  isConfirming: boolean;
  /** Whether transaction was confirmed on-chain */
  isSuccess: boolean;
  /** Reset state to idle */
  reset: () => void;
}

export interface UseAxiomVerifyReturn {
  /** Verification result with isValid flag and record */
  result: VerificationResult | undefined;
  /** Whether query is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Manually trigger re-fetch */
  refetch: () => void;
}

export interface UseIdentityReturn {
  /** Identity info for address */
  identity: IdentityInfo | undefined;
  /** Resolved address from name */
  resolvedAddress: `0x${string}` | undefined;
  /** Loading states */
  isLoadingIdentity: boolean;
  isLoadingAddress: boolean;
  /** Errors */
  identityError: Error | null;
  addressError: Error | null;
  /** Refetch functions */
  refetchIdentity: () => void;
  refetchAddress: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default registration fee (hardcoded for now) */
const REGISTRATION_FEE = parseEther("0.0001");

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for registering content on the Axiom Protocol.
 *
 * Wraps useWriteContract with transaction confirmation via useWaitForTransactionReceipt.
 * Returns "success" status only when the transaction is verified on-chain.
 *
 * @example
 * ```tsx
 * const { register, status, txHash, isSuccess } = useAxiomRegister();
 *
 * const handleSubmit = () => {
 *   register(contentHash, metadataURI);
 * };
 * ```
 */
export function useAxiomRegister(): UseAxiomRegisterReturn {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Track tx hash changes
  useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash]);

  // Handle errors with toast
  useEffect(() => {
    if (writeError) {
      const errorMessage = parseContractError(writeError);
      toast.error("Transaction Failed", {
        description: errorMessage,
      });
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      toast.error("Confirmation Failed", {
        description: confirmError.message,
      });
    }
  }, [confirmError]);

  // Show success toast
  useEffect(() => {
    if (isSuccess && txHash) {
      toast.success("Content Registered Successfully!", {
        description: `Transaction confirmed: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });
    }
  }, [isSuccess, txHash]);

  // Determine status
  const status: TransactionStatus = (() => {
    if (isSuccess) return "success";
    if (writeError || confirmError) return "error";
    if (isConfirming) return "confirming";
    if (isPending) return "pending";
    return "idle";
  })();

  const register = useCallback(
    (contentHash: `0x${string}`, metadataURI: string) => {
      writeContract({
        address: AXIOM_ROUTER_ADDRESS,
        abi: AXIOM_ROUTER_ABI,
        functionName: "register",
        args: [contentHash, metadataURI],
        value: REGISTRATION_FEE,
      });
    },
    [writeContract],
  );

  const reset = useCallback(() => {
    resetWrite();
    setTxHash(undefined);
  }, [resetWrite]);

  return {
    register,
    status,
    txHash,
    error: writeError || confirmError || null,
    isPending,
    isConfirming,
    isSuccess,
    reset,
  };
}

/**
 * Hook for verifying content on the Axiom Protocol.
 *
 * Wraps useReadContract calling verify(_contentHash, _claimedIssuer).
 * Returns typed data: { isValid: boolean, record: AxiomRecord }.
 *
 * @param contentHash - The SHA-256 hash of the content (bytes32)
 * @param claimedIssuer - The address claiming to be the issuer
 *
 * @example
 * ```tsx
 * const { result, isLoading, refetch } = useAxiomVerify(hash, issuerAddress);
 *
 * if (result?.isValid) {
 *   console.log("Content is authentic:", result.record);
 * }
 * ```
 */
export function useAxiomVerify(
  contentHash: `0x${string}` | undefined,
  claimedIssuer: `0x${string}` | undefined,
): UseAxiomVerifyReturn {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "verify",
    args:
      contentHash && claimedIssuer ? [contentHash, claimedIssuer] : undefined,
    query: {
      enabled: !!contentHash && !!claimedIssuer,
      // Enable refetching with custom queryKey
      refetchOnMount: true,
      staleTime: 0,
    },
  });

  // Parse raw contract response into typed result
  // Wagmi with the ABI returns [isValid, record] tuple
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRecord = data?.[1] as any;
  const result: VerificationResult | undefined = data
    ? {
        isValid: data[0] as boolean,
        record: {
          issuer: rawRecord.issuer as `0x${string}`,
          timestamp: BigInt(rawRecord.timestamp),
          status: rawRecord.status as number,
          algorithm: rawRecord.algorithm as number,
          contentHash: rawRecord.contentHash as `0x${string}`,
          metadataURI: rawRecord.metadataURI as string,
        },
      }
    : undefined;

  return {
    result,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch();
    },
  };
}

/**
 * Hook for identity resolution on the Axiom Protocol.
 *
 * Wraps useReadContract for resolveIdentity and resolveByName.
 *
 * @param address - Address to resolve identity for
 * @param name - Name to resolve to address
 *
 * @example
 * ```tsx
 * // Resolve by address
 * const { identity } = useIdentity({ address: "0x..." });
 *
 * // Resolve by name
 * const { resolvedAddress } = useIdentity({ name: "alice" });
 * ```
 */
export function useIdentity(params: {
  address?: `0x${string}`;
  name?: string;
}): UseIdentityReturn {
  const { address, name } = params;

  // Resolve identity by address
  const {
    data: identityData,
    isLoading: isLoadingIdentity,
    error: identityError,
    refetch: refetchIdentity,
  } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "resolveIdentity",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 0,
    },
  });

  // Resolve address by name
  const {
    data: addressData,
    isLoading: isLoadingAddress,
    error: addressError,
    refetch: refetchAddress,
  } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "resolveByName",
    args: name ? [name] : undefined,
    query: {
      enabled: !!name,
      staleTime: 0,
    },
  });

  // Parse identity data - Wagmi returns object structure from ABI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawIdentity = identityData as any;
  const identity: IdentityInfo | undefined = identityData
    ? {
        name: rawIdentity.name as string,
        proofURI: rawIdentity.proofURI as string,
        isVerified: rawIdentity.isVerified as boolean,
        registeredAt: BigInt(rawIdentity.registeredAt),
      }
    : undefined;

  return {
    identity,
    resolvedAddress: addressData as `0x${string}` | undefined,
    isLoadingIdentity,
    isLoadingAddress,
    identityError: identityError as Error | null,
    addressError: addressError as Error | null,
    refetchIdentity: () => {
      refetchIdentity();
    },
    refetchAddress: () => {
      refetchAddress();
    },
  };
}

/**
 * Hook to get the connected user's identity
 */
export function useMyIdentity() {
  const { address } = useAccount();
  return useIdentity({ address });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Parse contract errors into user-friendly messages
 */
function parseContractError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes("user rejected") || message.includes("user denied")) {
    return "Transaction was rejected by user";
  }
  if (message.includes("insufficient funds")) {
    return "Insufficient funds for transaction";
  }
  if (message.includes("network") || message.includes("chain")) {
    return "Please switch to the correct network";
  }
  if (message.includes("nonce")) {
    return "Transaction nonce error. Please reset your wallet.";
  }
  if (message.includes("already registered") || message.includes("duplicate")) {
    return "This content has already been registered";
  }

  // Return first 100 chars of error message
  return error.message.slice(0, 100);
}
