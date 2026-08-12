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
  IS_AXIOM_ROUTER_CONFIGURED,
  ROUTER_CONFIGURATION_ERROR,
} from "@/lib/contracts/axiom-router";
import {
  TARGET_CHAIN_ID,
  isSupportedChain,
} from "@/lib/wagmi-config";
import { toast } from "sonner";

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

  const isCorrectNetwork = isSupportedChain(chainId);
  const isWrongNetwork = isConnected && !isCorrectNetwork;

  return {
    chainId,
    isCorrectNetwork,
    isWrongNetwork,
    targetChainId: TARGET_CHAIN_ID,
    isContractConfigured: IS_AXIOM_ROUTER_CONFIGURED,
    configurationError: ROUTER_CONFIGURATION_ERROR,
  };
}

// Registration fees may differ per account (for example enterprise rates).
export function useRegistrationFee(user: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    chainId: TARGET_CHAIN_ID,
    functionName: "getFee",
    args: user ? [user] : undefined,
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED && !!user,
      staleTime: 15_000,
    },
  });

  return {
    registrationFee: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook to register content
export function useRegisterContent() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { address } = useAccount();
  const { registrationFee, isLoading: isLoadingFee, error: feeError } =
    useRegistrationFee(address);
  const { isWrongNetwork } = useNetworkStatus();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: TARGET_CHAIN_ID,
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
    if (!IS_AXIOM_ROUTER_CONFIGURED) {
      toast.error("Contract Unavailable", {
        description: ROUTER_CONFIGURATION_ERROR || "Router is not configured.",
      });
      return;
    }
    if (!address) {
      toast.error("Wallet Required", {
        description: "Connect your wallet before registering content.",
      });
      return;
    }
    if (isWrongNetwork) {
      toast.error("Wrong Network", {
        description: "Switch to Sepolia before registering content.",
      });
      return;
    }
    if (registrationFee === undefined) {
      toast.error("Fee Unavailable", {
        description: "Could not fetch your registration fee. Please try again.",
      });
      return;
    }

    try {
      writeContract({
        address: AXIOM_ROUTER_ADDRESS,
        abi: AXIOM_ROUTER_ABI,
        chainId: TARGET_CHAIN_ID,
        functionName: "register",
        args: [contentHash, metadataURI],
        value: registrationFee,
      });
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  const reset = () => {
    resetWrite();
    setTxHash(undefined);
  };

  return {
    register,
    txHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    registrationFee,
    isLoadingFee,
    error: writeError || confirmError || feeError,
    reset,
  };
}

// Hook to revoke content
export function useRevokeContent() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } =
    useWaitForTransactionReceipt({
      hash,
      chainId: TARGET_CHAIN_ID,
    });

  const revoke = async (recordId: `0x${string}`, reason: string) => {
    if (!ensureWriteReady(address, chainId)) return;
    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      chainId: TARGET_CHAIN_ID,
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
    error: error || receiptError,
  };
}

// Hook to register identity
export function useRegisterIdentity() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error, reset } =
    useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } =
    useWaitForTransactionReceipt({
      hash,
      chainId: TARGET_CHAIN_ID,
    });

  const registerIdentity = async (name: string, proofURI: string) => {
    if (!ensureWriteReady(address, chainId)) return;
    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      chainId: TARGET_CHAIN_ID,
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
    error: error || receiptError,
    reset,
  };
}

// Hook to update identity
export function useUpdateIdentity() {
  const { address } = useAccount();
  const chainId = useChainId();
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } =
    useWaitForTransactionReceipt({
      hash,
      chainId: TARGET_CHAIN_ID,
    });

  const updateIdentity = async (name: string, proofURI: string) => {
    if (!ensureWriteReady(address, chainId)) return;
    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      chainId: TARGET_CHAIN_ID,
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
    error: error || receiptError,
    reset,
  };
}

export function useIdentity({ address }: { address?: `0x${string}` }) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    chainId: TARGET_CHAIN_ID,
    functionName: "resolveIdentity",
    args: address ? [address] : undefined,
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED && !!address,
      retry: 1,
    },
  });

  // Safe parsing for Tuple returns in Wagmi/Viem
  const parseIdentity = (rawData: unknown): IdentityInfo | undefined => {
    if (!rawData) return undefined;

    // Jika kembaliannya berbentuk Array (contoh: ["Rakan Aji", "ipfs://...", false, 17000000])
    if (Array.isArray(rawData)) {
      return {
        name: rawData[0] || "",
        proofURI: rawData[1] || "",
        isVerified: rawData[2] || false,
        registeredAt: rawData[3] ? Number(rawData[3]) : 0,
      };
    }

    // Jika kembaliannya berbentuk Object (contoh: { name: "Rakan Aji", ... })
    const value = rawData as Record<string, unknown>;
    return {
      name: String(value.name || ""),
      proofURI: String(value.proofURI || ""),
      isVerified: Boolean(value.isVerified),
      registeredAt: value.registeredAt ? Number(value.registeredAt) : 0,
    };
  };

  const identity = parseIdentity(data);

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

function ensureWriteReady(
  address: `0x${string}` | undefined,
  chainId: number,
): boolean {
  if (!IS_AXIOM_ROUTER_CONFIGURED) {
    toast.error("Contract Unavailable", {
      description: ROUTER_CONFIGURATION_ERROR || "Router is not configured.",
    });
    return false;
  }
  if (!address) {
    toast.error("Connect a wallet first");
    return false;
  }
  if (chainId !== TARGET_CHAIN_ID) {
    toast.error("Switch to Sepolia before submitting");
    return false;
  }
  return true;
}
