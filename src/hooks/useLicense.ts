"use client";

/**
 * License Hooks for Axiom Protocol
 *
 * Custom hooks for creating, purchasing, and reading license data
 * from the AxiomLicenseFacet via the Diamond Proxy router.
 */

import { useEffect, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { toast } from "sonner";

import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
} from "@/lib/contracts/axiom-router";

// ============================================================================
// TYPES
// ============================================================================

export interface LicenseInfo {
  recordId: `0x${string}`;
  licensor: `0x${string}`;
  licensee: `0x${string}`;
  paymentToken: `0x${string}`;
  licenseType: number;
  royaltyBps: number;
  exclusive: boolean;
  sublicensable: boolean;
  transferable: boolean;
  active: boolean;
  validFrom: number;
  validUntil: number;
  price: bigint;
  priceFormatted: string;
  customTermsURI: string;
  territoryRestrictions: string;
}

// ============================================================================
// WRITE HOOKS
// ============================================================================

/**
 * Hook for creating a license on a registered content record.
 *
 * Wraps useWriteContract calling createLicense with 9 args.
 * Includes transaction confirmation tracking and toast notifications.
 */
export function useCreateLicense() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const {
    writeContract,
    data: hash,
    isPending,
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
    if (writeError) {
      toast.error("License Creation Failed", {
        description: parseContractError(writeError),
      });
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      toast.error("Confirmation Failed", {
        description: confirmError.message.slice(0, 100),
      });
    }
  }, [confirmError]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success("License Created!", {
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });
    }
  }, [isConfirmed, txHash]);

  const createLicense = (params: {
    recordId: `0x${string}`;
    licenseType: number;
    priceEth: string;
    royaltyPercent: number;
    exclusive: boolean;
  }) => {
    const priceWei = parseEther(params.priceEth || "0");
    const royaltyBps = params.royaltyPercent * 100; // 5% = 500 bps

    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      functionName: "createLicense",
      args: [
        params.recordId,
        params.licenseType,
        priceWei,
        "0x0000000000000000000000000000000000000000" as `0x${string}`, // paymentToken: Native ETH
        royaltyBps,
        0, // validUntil: Forever
        params.exclusive,
        false, // sublicensable: false
        "", // customTermsURI: empty
      ],
    });
  };

  return {
    createLicense,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
    reset,
  };
}

/**
 * Hook for purchasing a license (payable).
 *
 * Sends ETH value equal to the license price.
 * Duration is hardcoded to 0 (lifetime) for MVP.
 */
export function usePurchaseLicense() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const {
    writeContract,
    data: hash,
    isPending,
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
    if (writeError) {
      toast.error("License Purchase Failed", {
        description: parseContractError(writeError),
      });
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      toast.error("Confirmation Failed", {
        description: confirmError.message.slice(0, 100),
      });
    }
  }, [confirmError]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success("License Purchased!", {
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });
    }
  }, [isConfirmed, txHash]);

  const purchaseLicense = (licenseId: bigint, priceWei: bigint) => {
    writeContract({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      functionName: "purchaseLicense",
      args: [licenseId, 0], // duration hardcoded to 0 (lifetime)
      value: priceWei,
    });
  };

  return {
    purchaseLicense,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
    reset,
  };
}

// ============================================================================
// READ HOOKS
// ============================================================================

/**
 * Hook to get all license IDs for a specific content record.
 *
 * @param recordId - bytes32 record identifier
 * @returns Array of license IDs (uint256[])
 */
export function useLicensesByRecord(recordId: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getLicensesByRecord",
    args: recordId ? [recordId] : undefined,
    query: {
      enabled: !!recordId,
      staleTime: 30_000,
    },
  });

  return {
    licenseIds: (data as bigint[]) || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get full license details by ID.
 *
 * Parses the License struct from the contract, safely converting
 * all BigInt fields to avoid serialization errors.
 *
 * @param licenseId - uint256 license identifier
 */
export function useLicenseInfo(licenseId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getLicense",
    args: licenseId !== undefined ? [licenseId] : undefined,
    query: {
      enabled: licenseId !== undefined,
      staleTime: 30_000,
    },
  });

  // Parse the License struct safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  const license: LicenseInfo | undefined = raw
    ? {
        recordId: raw.recordId as `0x${string}`,
        licensor: raw.licensor as `0x${string}`,
        licensee: raw.licensee as `0x${string}`,
        paymentToken: raw.paymentToken as `0x${string}`,
        licenseType: Number(raw.licenseType),
        royaltyBps: Number(raw.royaltyBps),
        exclusive: raw.exclusive as boolean,
        sublicensable: raw.sublicensable as boolean,
        transferable: raw.transferable as boolean,
        active: raw.active as boolean,
        validFrom: Number(raw.validFrom),
        validUntil: Number(raw.validUntil),
        price: raw.price as bigint,
        priceFormatted: formatEther(raw.price as bigint),
        customTermsURI: raw.customTermsURI as string,
        territoryRestrictions: raw.territoryRestrictions as string,
      }
    : undefined;

  return {
    license,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function parseContractError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes("user rejected") || message.includes("user denied")) {
    return "Transaction was rejected by user";
  }
  if (message.includes("insufficient funds")) {
    return "Insufficient funds for transaction";
  }
  if (message.includes("not the owner") || message.includes("unauthorized")) {
    return "You are not the owner of this content";
  }
  if (message.includes("already exists")) {
    return "A license already exists for this record";
  }

  return error.message.slice(0, 100);
}
