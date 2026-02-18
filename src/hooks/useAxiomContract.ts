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
  timestamp: number;
  uri: string;
}

// Identity info from resolveIdentity
export interface IdentityInfo {
  name: string;
  proofURI: string;
  isVerified: boolean;
  registeredAt: number;
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

// Hook to get protocol base fee
export function useProtocolFee() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getBaseFee",
  });

  return {
    baseFee: data as bigint | undefined,
    isLoading,
    error,
    refetch,
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
        timestamp: rawRecord?.timestamp ? Number(rawRecord.timestamp) : 0,
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
            navigator.clipboard.writeText(txHash);
          },
        },
      });
    }
  }, [isConfirmed, txHash]);

  const register = async (contentHash: `0x${string}`, metadataURI: string) => {
    if (!baseFee) {
      toast.error("Fee Unavailable", {
        description: "Could not fetch protocol fee. Please try again.",
      });
      return;
    }

    try {
      writeContract({
        address: AXIOM_ROUTER_ADDRESS,
        abi: AXIOM_ROUTER_ABI,
        functionName: "register",
        args: [contentHash, metadataURI],
        value: baseFee,
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

// Hook to dispute content
export function useDisputeContent() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const dispute = async (recordId: `0x${string}`, reason: string) => {
    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      functionName: "disputeContent",
      args: [recordId, reason],
    });
  };

  return {
    dispute,
    txHash: hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
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

// Hook to update identity
export function useUpdateIdentity() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const updateIdentity = async (name: string, proofURI: string) => {
    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      functionName: "updateIdentity",
      args: [name, proofURI],
    });
  };

  return {
    updateIdentity,
    txHash: hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  };
}

// Hook to read identity by address
export function useIdentity({ address }: { address?: `0x${string}` }) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "resolveIdentity",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: 1,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  const identity: IdentityInfo | undefined = data
    ? {
        name: raw.name as string,
        proofURI: raw.proofURI as string,
        isVerified: raw.isVerified as boolean,
        registeredAt: Number(raw.registeredAt),
      }
    : undefined;

  return {
    identity,
    isLoadingIdentity: isLoading,
    identityError: error,
    refetchIdentity: refetch,
  };
}

// Hook to get the connected user's identity
export function useMyIdentity() {
  const { address } = useAccount();
  return useIdentity({ address });
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
