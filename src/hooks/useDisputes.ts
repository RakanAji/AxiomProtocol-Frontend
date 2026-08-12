"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";

import { ZERO_ADDRESS, isNativeToken } from "@/lib/axiom-domain";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
  IS_AXIOM_ROUTER_CONFIGURED,
  ROUTER_CONFIGURATION_ERROR,
} from "@/lib/contracts/axiom-router";
import { ERC20_ABI } from "@/lib/contracts/erc20";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

export { DISPUTE_REASONS, DISPUTE_STATUSES } from "@/lib/axiom-domain";

const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;

export interface StakeConfig {
  minStakeAmount: bigint;
  minAppealStake: bigint;
  stakeToken: `0x${string}`;
  protocolFeeBps: number;
  rewardBps: number;
  slashBps: number;
  responsePeriod: number;
  evidencePeriod: number;
  appealPeriod: number;
}

export interface DisputeDetail {
  disputeId: `0x${string}`;
  recordId: `0x${string}`;
  externalDisputeId: `0x${string}`;
  challenger: `0x${string}`;
  arbitrator: `0x${string}`;
  reason: number;
  status: number;
  stakeAmount: bigint;
  stakeToken: `0x${string}`;
  createdAt: number;
  deadline: number;
  resolvedAt: number;
  evidenceURI: string;
  responseURI: string;
}

export type DisputePhase =
  | "idle"
  | "checking"
  | "approving"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

interface ReadResult {
  status: "success" | "failure";
  result?: unknown;
  error?: Error;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function parseStakeConfig(raw: unknown): StakeConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  return {
    minStakeAmount:
      (value.minStakeAmount as bigint | undefined) ?? BigInt(0),
    minAppealStake:
      (value.minAppealStake as bigint | undefined) ?? BigInt(0),
    stakeToken:
      (value.stakeToken as `0x${string}` | undefined) ?? ZERO_ADDRESS,
    protocolFeeBps: Number(value.protocolFeeBps ?? 0),
    rewardBps: Number(value.rewardBps ?? 0),
    slashBps: Number(value.slashBps ?? 0),
    responsePeriod: Number(value.responsePeriod ?? 0),
    evidencePeriod: Number(value.evidencePeriod ?? 0),
    appealPeriod: Number(value.appealPeriod ?? 0),
  };
}

function parseDispute(raw: unknown): DisputeDetail | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as Record<string, unknown>;
  if (!value.disputeId || !value.recordId) return undefined;
  return {
    disputeId: value.disputeId as `0x${string}`,
    recordId: value.recordId as `0x${string}`,
    externalDisputeId: value.externalDisputeId as `0x${string}`,
    challenger: value.challenger as `0x${string}`,
    arbitrator: value.arbitrator as `0x${string}`,
    reason: Number(value.reason ?? 0),
    status: Number(value.status ?? 0),
    stakeAmount: (value.stakeAmount as bigint | undefined) ?? BigInt(0),
    stakeToken:
      (value.stakeToken as `0x${string}` | undefined) ?? ZERO_ADDRESS,
    createdAt: Number(value.createdAt ?? 0),
    deadline: Number(value.deadline ?? 0),
    resolvedAt: Number(value.resolvedAt ?? 0),
    evidenceURI: String(value.evidenceURI ?? ""),
    responseURI: String(value.responseURI ?? ""),
  };
}

export function useStakeConfig() {
  const query = useReadContract({
    ...routerConfig,
    functionName: "getStakeConfig",
    query: { enabled: IS_AXIOM_ROUTER_CONFIGURED, staleTime: 15_000 },
  });
  return {
    config: parseStakeConfig(query.data),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** ETH and configured ERC-20 dispute staking with an explicit approval phase. */
export function useInitiateDispute() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: TARGET_CHAIN_ID });
  const { writeContractAsync, reset: resetWrite } = useWriteContract();
  const [phase, setPhase] = useState<DisputePhase>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [approvalTxHash, setApprovalTxHash] =
    useState<`0x${string}` | undefined>();
  const [error, setError] = useState<Error | null>(null);

  const initiateDispute = useCallback(
    async (
      recordId: `0x${string}`,
      reason: number,
      evidenceURI: string,
      config: StakeConfig,
    ) => {
      setError(null);
      if (!IS_AXIOM_ROUTER_CONFIGURED) {
        const configError = new Error(
          ROUTER_CONFIGURATION_ERROR || "Router is not configured",
        );
        setError(configError);
        setPhase("error");
        return;
      }
      if (!address || chainId !== TARGET_CHAIN_ID || !publicClient) {
        const walletError = new Error("Connect a wallet on Sepolia first");
        setError(walletError);
        setPhase("error");
        return;
      }

      try {
        if (!isNativeToken(config.stakeToken)) {
          setPhase("checking");
          const [allowance, balance] = await Promise.all([
            publicClient.readContract({
              address: config.stakeToken,
              abi: ERC20_ABI,
              functionName: "allowance",
              args: [address, AXIOM_ROUTER_ADDRESS],
            }),
            publicClient.readContract({
              address: config.stakeToken,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            }),
          ]);
          if (balance < config.minStakeAmount) {
            throw new Error("Insufficient token balance for the required stake");
          }
          if (allowance < config.minStakeAmount) {
            setPhase("approving");
            const approvalHash = await writeContractAsync({
              address: config.stakeToken,
              abi: ERC20_ABI,
              chainId: TARGET_CHAIN_ID,
              functionName: "approve",
              args: [AXIOM_ROUTER_ADDRESS, config.minStakeAmount],
            });
            setApprovalTxHash(approvalHash);
            const receipt = await publicClient.waitForTransactionReceipt({
              hash: approvalHash,
            });
            if (receipt.status !== "success") {
              throw new Error("Stake token approval reverted");
            }
          }
        }

        setPhase("submitting");
        const disputeHash = isNativeToken(config.stakeToken)
          ? await writeContractAsync({
              ...routerConfig,
              functionName: "initiateDispute",
              args: [recordId, reason, evidenceURI],
              value: config.minStakeAmount,
            })
          : await writeContractAsync({
              ...routerConfig,
              functionName: "initiateDisputeWithToken",
              args: [
                recordId,
                reason,
                evidenceURI,
                config.stakeToken,
                config.minStakeAmount,
              ],
            });
        setTxHash(disputeHash);
        setPhase("confirming");
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: disputeHash,
        });
        if (receipt.status !== "success") throw new Error("Dispute transaction reverted");
        setPhase("success");
        toast.success("Dispute initiated", {
          description: "The configured stake is now locked by the protocol.",
        });
      } catch (submitError) {
        const normalized = toError(submitError);
        setError(normalized);
        setPhase("error");
        toast.error("Dispute transaction failed", {
          description: normalized.message.slice(0, 180),
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
    initiateDispute,
    phase,
    txHash,
    approvalTxHash,
    error,
    isPending: ["checking", "approving", "submitting"].includes(phase),
    isConfirming: phase === "confirming",
    isConfirmed: phase === "success",
    reset,
  };
}

export function useRespondToDispute() {
  const { address } = useAccount();
  const chainId = useChainId();
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: TARGET_CHAIN_ID,
  });

  useEffect(() => {
    if (receipt.isSuccess) {
      toast.success("Response submitted", {
        description: "The defense evidence URI is recorded on-chain.",
      });
    }
  }, [receipt.isSuccess]);

  useEffect(() => {
    const error = writeError || receipt.error;
    if (error) {
      toast.error("Response failed", {
        description: error.message.slice(0, 160),
      });
    }
  }, [receipt.error, writeError]);

  const respondToDispute = (
    disputeId: `0x${string}`,
    responseURI: string,
  ) => {
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
    writeContract({
      ...routerConfig,
      functionName: "respondToDispute",
      args: [disputeId, responseURI],
    });
  };

  return {
    respondToDispute,
    isPending,
    isConfirming: receipt.isLoading,
    isConfirmed: receipt.isSuccess,
    txHash,
    error: writeError || receipt.error,
    reset,
  };
}

export function useMyDisputes(userAddress: `0x${string}` | undefined) {
  const idsQuery = useReadContract({
    ...routerConfig,
    functionName: "getDisputesByChallenger",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED && !!userAddress,
      staleTime: 15_000,
    },
  });
  const disputeIds =
    (idsQuery.data as readonly `0x${string}`[] | undefined) ?? [];
  const detailsQuery = useReadContracts({
    contracts: disputeIds.map((id) => ({
      ...routerConfig,
      functionName: "getDispute" as const,
      args: [id] as const,
    })),
    query: { enabled: disputeIds.length > 0, staleTime: 15_000 },
  });
  const results = (detailsQuery.data ?? []) as readonly ReadResult[];
  const disputes = results.flatMap((result) => {
    const dispute = result.status === "success" ? parseDispute(result.result) : undefined;
    return dispute ? [dispute] : [];
  });
  const partialFailure = results.some((result) => result.status === "failure");

  return {
    disputes,
    totalDisputes: disputeIds.length,
    isLoading: idsQuery.isLoading || detailsQuery.isLoading,
    error: idsQuery.error || detailsQuery.error,
    partialFailure,
    refetch: async () => {
      await idsQuery.refetch();
      await detailsQuery.refetch();
    },
  };
}
