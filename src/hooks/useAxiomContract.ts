"use client";

import { useEffect, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from "wagmi";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
} from "@/lib/contracts/axiom-router";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";
import { toast } from "sonner";

// Types for verification result
export interface VerificationResult {
  isValid: boolean;
  issuer: `0x${string}`;
  timestamp: bigint;
  uri: string;
}

// Hook to check if connected to correct network
export function useNetworkStatus() {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  const isCorrectNetwork = chainId === TARGET_CHAIN_ID;
  const isWrongNetwork = isConnected && !isCorrectNetwork;

  return {
    chainId,
    isCorrectNetwork,
    isWrongNetwork,
    targetChainId: TARGET_CHAIN_ID,
  };
}

// Hook to get contract version
export function useAxiomVersion() {
  const { data, isLoading, error } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "VERSION",
  });

  return {
    version: data as string | undefined,
    isLoading,
    error,
  };
}

// Hook to verify content
export function useVerifyContent(
  contentHash: `0x${string}` | undefined,
  claimedIssuer: `0x${string}` | undefined,
) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "verify",
    args:
      contentHash && claimedIssuer ? [contentHash, claimedIssuer] : undefined,
    query: {
      enabled: !!contentHash && !!claimedIssuer,
    },
  });

  // Parse result - verify() returns [isValid: boolean, record: AxiomRecord]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRecord = data?.[1] as any;
  const result: VerificationResult | undefined = data
    ? {
        isValid: data[0],
        issuer: rawRecord?.issuer as `0x${string}`,
        timestamp: rawRecord?.timestamp
          ? BigInt(rawRecord.timestamp)
          : BigInt(0),
        uri: rawRecord?.metadataURI as string,
      }
    : undefined;

  return {
    result,
    isLoading,
    error,
    refetch,
  };
}

// Hook to verify content by hash only (checks if hash exists)
export function useVerifyContentByHash(contentHash: `0x${string}` | undefined) {
  const { address } = useAccount();

  // If no issuer specified, use zero address or connected address
  const issuerToCheck = address || "0x0000000000000000000000000000000000000000";

  return useVerifyContent(contentHash, issuerToCheck as `0x${string}`);
}

// Hook to register content
export function useRegisterContent() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

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
  } = useWaitForTransactionReceipt({
    hash,
  });

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

  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success("Content Registered!", {
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
        action: {
          label: "View",
          onClick: () => {
            // For local, just copy to clipboard
            navigator.clipboard.writeText(txHash);
          },
        },
      });
    }
  }, [isConfirmed, txHash]);

  const register = async (contentHash: `0x${string}`, metadataURI: string) => {
    try {
      writeContract({
        address: AXIOM_ROUTER_ADDRESS,
        abi: AXIOM_ROUTER_ABI,
        functionName: "register",
        args: [contentHash, metadataURI],
      });
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  return {
    register,
    txHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
    reset,
  };
}

// Hook to revoke content
export function useRevokeContent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const revoke = async (recordId: `0x${string}`, reason: string) => {
    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      functionName: "revoke",
      args: [recordId, reason],
    });
  };

  return {
    revoke,
    txHash: hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Hook to register identity
export function useRegisterIdentity() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const registerIdentity = async (name: string, proofURI: string) => {
    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      functionName: "registerIdentity",
      args: [name, proofURI],
    });
  };

  return {
    registerIdentity,
    txHash: hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Helper function to parse contract errors
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

  // Return first 100 chars of error message
  return error.message.slice(0, 100);
}
