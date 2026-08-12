"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatUnits,
  isAddress,
  parseEther,
  parseUnits,
} from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";

import {
  ZERO_ADDRESS,
  isNativeToken,
  type TokenMetadata,
} from "@/lib/axiom-domain";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
  IS_AXIOM_ROUTER_CONFIGURED,
  ROUTER_CONFIGURATION_ERROR,
} from "@/lib/contracts/axiom-router";
import { ERC20_ABI } from "@/lib/contracts/erc20";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;

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
  customTermsURI: string;
  territoryRestrictions: string;
}

export interface CreateLicenseParams {
  recordId: `0x${string}`;
  licenseType: number;
  price: string;
  paymentToken: `0x${string}`;
  paymentTokenDecimals: number;
  royaltyBps: number;
  validUntil: number;
  exclusive: boolean;
  sublicensable: boolean;
  customTermsURI: string;
}

export interface PurchaseLicenseParams {
  licenseId: bigint;
  price: bigint;
  paymentToken: `0x${string}`;
  duration?: number;
}

export type PurchasePhase =
  | "idle"
  | "checking"
  | "approving"
  | "purchasing"
  | "confirming"
  | "success"
  | "error";

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function parseLicense(raw: unknown): LicenseInfo | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as Record<string, unknown>;
  return {
    recordId: value.recordId as `0x${string}`,
    licensor: value.licensor as `0x${string}`,
    licensee: value.licensee as `0x${string}`,
    paymentToken: value.paymentToken as `0x${string}`,
    licenseType: Number(value.licenseType ?? 0),
    royaltyBps: Number(value.royaltyBps ?? 0),
    exclusive: Boolean(value.exclusive),
    sublicensable: Boolean(value.sublicensable),
    transferable: Boolean(value.transferable),
    active: Boolean(value.active),
    validFrom: Number(value.validFrom ?? 0),
    validUntil: Number(value.validUntil ?? 0),
    price: (value.price as bigint | undefined) ?? BigInt(0),
    customTermsURI: String(value.customTermsURI ?? ""),
    territoryRestrictions: String(value.territoryRestrictions ?? ""),
  };
}

export function useTokenMetadata(token: `0x${string}` | undefined) {
  const enabled =
    IS_AXIOM_ROUTER_CONFIGURED && !!token && !isNativeToken(token);
  const decimalsQuery = useReadContract({
    address: token || ZERO_ADDRESS,
    abi: ERC20_ABI,
    chainId: TARGET_CHAIN_ID,
    functionName: "decimals",
    query: { enabled, staleTime: Infinity },
  });
  const symbolQuery = useReadContract({
    address: token || ZERO_ADDRESS,
    abi: ERC20_ABI,
    chainId: TARGET_CHAIN_ID,
    functionName: "symbol",
    query: { enabled, staleTime: Infinity },
  });

  const metadata: TokenMetadata | undefined = !token
    ? undefined
    : isNativeToken(token)
      ? { decimals: 18, symbol: "ETH" }
      : decimalsQuery.data !== undefined && symbolQuery.data
        ? {
            decimals: Number(decimalsQuery.data),
            symbol: String(symbolQuery.data),
          }
        : undefined;

  return {
    metadata,
    isLoading: decimalsQuery.isLoading || symbolQuery.isLoading,
    error: decimalsQuery.error || symbolQuery.error,
  };
}

export function useCreateLicense() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const chainId = useChainId();
  const { address } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash,
    chainId: TARGET_CHAIN_ID,
  });

  useEffect(() => {
    if (hash) setTxHash(hash);
  }, [hash]);

  useEffect(() => {
    if (writeError) {
      toast.error("License creation failed", {
        description: parseContractError(writeError),
      });
    }
  }, [writeError]);

  useEffect(() => {
    if (receipt.error) {
      toast.error("License confirmation failed", {
        description: receipt.error.message.slice(0, 140),
      });
    }
  }, [receipt.error]);

  useEffect(() => {
    if (receipt.isSuccess && txHash) {
      toast.success("License template created", {
        description: `${txHash.slice(0, 10)}…${txHash.slice(-8)}`,
      });
    }
  }, [receipt.isSuccess, txHash]);

  const createLicense = useCallback(
    (params: CreateLicenseParams) => {
      if (!IS_AXIOM_ROUTER_CONFIGURED) {
        toast.error("Contract unavailable", {
          description: ROUTER_CONFIGURATION_ERROR || undefined,
        });
        return;
      }
      if (!address || chainId !== TARGET_CHAIN_ID) {
        toast.error("Connect a wallet on Sepolia first");
        return;
      }
      if (!isAddress(params.paymentToken)) {
        toast.error("Invalid payment token address");
        return;
      }
      if (params.royaltyBps < 0 || params.royaltyBps > 10_000) {
        toast.error("Royalty must be between 0% and 100%");
        return;
      }
      if (params.validUntil !== 0 && params.validUntil <= Date.now() / 1000) {
        toast.error("License expiry must be in the future");
        return;
      }
      if (params.licenseType === 11 && !params.customTermsURI.trim()) {
        toast.error("Custom licenses require a terms URI");
        return;
      }

      let price: bigint;
      try {
        price = isNativeToken(params.paymentToken)
          ? parseEther(params.price || "0")
          : parseUnits(params.price || "0", params.paymentTokenDecimals);
      } catch {
        toast.error("Enter a valid license price");
        return;
      }

      writeContract({
        ...routerConfig,
        functionName: "createLicense",
        args: [
          params.recordId,
          params.licenseType,
          price,
          params.paymentToken,
          params.royaltyBps,
          params.validUntil,
          params.exclusive,
          params.sublicensable,
          params.customTermsURI.trim(),
        ],
      });
    },
    [address, chainId, writeContract],
  );

  const reset = useCallback(() => {
    resetWrite();
    setTxHash(undefined);
  }, [resetWrite]);

  return {
    createLicense,
    txHash,
    isPending,
    isConfirming: receipt.isLoading,
    isConfirmed: receipt.isSuccess,
    error: writeError || receipt.error,
    reset,
  };
}

/**
 * Purchases either an ETH or ERC-20 license. ERC-20 purchases first verify the
 * buyer balance/allowance and wait for an approval receipt when needed.
 */
export function usePurchaseLicense() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: TARGET_CHAIN_ID });
  const { writeContractAsync, reset: resetWrite } = useWriteContract();
  const [phase, setPhase] = useState<PurchasePhase>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [approvalTxHash, setApprovalTxHash] =
    useState<`0x${string}` | undefined>();
  const [error, setError] = useState<Error | null>(null);

  const purchaseLicense = useCallback(
    async (params: PurchaseLicenseParams) => {
      setError(null);
      if (!IS_AXIOM_ROUTER_CONFIGURED) {
        const configError = new Error(
          ROUTER_CONFIGURATION_ERROR || "Router is not configured",
        );
        setError(configError);
        setPhase("error");
        toast.error("Contract unavailable", { description: configError.message });
        return;
      }
      if (!address || chainId !== TARGET_CHAIN_ID || !publicClient) {
        const walletError = new Error("Connect a wallet on Sepolia first");
        setError(walletError);
        setPhase("error");
        toast.error(walletError.message);
        return;
      }

      try {
        if (!isNativeToken(params.paymentToken) && params.price > BigInt(0)) {
          setPhase("checking");
          const [allowance, balance] = await Promise.all([
            publicClient.readContract({
              address: params.paymentToken,
              abi: ERC20_ABI,
              functionName: "allowance",
              args: [address, AXIOM_ROUTER_ADDRESS],
            }),
            publicClient.readContract({
              address: params.paymentToken,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            }),
          ]);
          if (balance < params.price) {
            throw new Error("Insufficient token balance for this license");
          }
          if (allowance < params.price) {
            setPhase("approving");
            const approvalHash = await writeContractAsync({
              address: params.paymentToken,
              abi: ERC20_ABI,
              chainId: TARGET_CHAIN_ID,
              functionName: "approve",
              args: [AXIOM_ROUTER_ADDRESS, params.price],
            });
            setApprovalTxHash(approvalHash);
            const approvalReceipt = await publicClient.waitForTransactionReceipt({
              hash: approvalHash,
            });
            if (approvalReceipt.status !== "success") {
              throw new Error("Token approval reverted");
            }
          }
        }

        setPhase("purchasing");
        const purchaseHash = await writeContractAsync({
          ...routerConfig,
          functionName: "purchaseLicense",
          args: [params.licenseId, params.duration ?? 0],
          value: isNativeToken(params.paymentToken) ? params.price : BigInt(0),
        });
        setTxHash(purchaseHash);
        setPhase("confirming");
        const purchaseReceipt = await publicClient.waitForTransactionReceipt({
          hash: purchaseHash,
        });
        if (purchaseReceipt.status !== "success") {
          throw new Error("License purchase reverted");
        }
        setPhase("success");
        toast.success("License purchased", {
          description: `${purchaseHash.slice(0, 10)}…${purchaseHash.slice(-8)}`,
        });
      } catch (purchaseError) {
        const normalized = toError(purchaseError);
        setError(normalized);
        setPhase("error");
        toast.error("License purchase failed", {
          description: parseContractError(normalized),
        });
      }
    },
    [address, chainId, publicClient, writeContractAsync],
  );

  const reset = useCallback(() => {
    resetWrite();
    setPhase("idle");
    setTxHash(undefined);
    setApprovalTxHash(undefined);
    setError(null);
  }, [resetWrite]);

  return {
    purchaseLicense,
    phase,
    txHash,
    approvalTxHash,
    error,
    isPending: ["checking", "approving", "purchasing"].includes(phase),
    isConfirming: phase === "confirming",
    isSuccess: phase === "success",
    reset,
  };
}

export function useLicensesByRecord(recordId: `0x${string}` | undefined) {
  const query = useReadContract({
    ...routerConfig,
    functionName: "getLicensesByRecord",
    args: recordId ? [recordId] : undefined,
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED && !!recordId,
      staleTime: 30_000,
    },
  });
  return {
    licenseIds: (query.data as readonly bigint[] | undefined) ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useLicenseInfo(licenseId: bigint | undefined) {
  const query = useReadContract({
    ...routerConfig,
    functionName: "getLicense",
    args: licenseId !== undefined ? [licenseId] : undefined,
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED && licenseId !== undefined,
      staleTime: 30_000,
    },
  });
  return {
    license: parseLicense(query.data),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function formatRawTokenAmount(
  amount: bigint,
  metadata: TokenMetadata,
): string {
  return `${formatUnits(amount, metadata.decimals)} ${metadata.symbol}`;
}

function parseContractError(error: Error): string {
  const message = error.message.toLowerCase();
  if (message.includes("user rejected") || message.includes("user denied")) {
    return "Transaction was rejected in the wallet";
  }
  if (message.includes("insufficient funds")) {
    return "Insufficient funds for the transaction and gas";
  }
  if (message.includes("not the owner") || message.includes("notlicensor")) {
    return "Only the content issuer can create this license";
  }
  return error.message.slice(0, 180);
}
