"use client";

import { useEffect } from "react";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
} from "@/lib/contracts/axiom-router";

// ============================================================================
// CONSTANTS
// ============================================================================

const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
} as const;

export const DISPUTE_REASONS: Record<number, string> = {
  0: "None",
  1: "Copyright",
  2: "Inappropriate",
  3: "Plagiarism",
  4: "Other",
};

export const DISPUTE_STATUSES: Record<number, string> = {
  0: "Pending",
  1: "Responded",
  2: "Resolved — Upheld",
  3: "Resolved — Rejected",
  4: "Resolved — Partial",
  5: "Appealed",
  6: "Expired",
};

// ============================================================================
// useStakeConfig — read the protocol's staking parameters
// ============================================================================

export interface StakeConfig {
  minStakeAmount: bigint;
  minStakeAmountFormatted: string;
  minAppealStake: bigint;
  minAppealStakeFormatted: string;
  stakeToken: `0x${string}`;
  protocolFeeBps: number;
  rewardBps: number;
  slashBps: number;
  responsePeriod: number;
  evidencePeriod: number;
  appealPeriod: number;
}

export function useStakeConfig() {
  const { data, isLoading, error } = useReadContract({
    ...routerConfig,
    functionName: "getStakeConfig",
  });

  let config: StakeConfig | null = null;

  if (data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = data as any;
    config = {
      minStakeAmount: raw.minStakeAmount ?? BigInt(0),
      minStakeAmountFormatted: formatEther(raw.minStakeAmount ?? BigInt(0)),
      minAppealStake: raw.minAppealStake ?? BigInt(0),
      minAppealStakeFormatted: formatEther(raw.minAppealStake ?? BigInt(0)),
      stakeToken:
        raw.stakeToken ?? "0x0000000000000000000000000000000000000000",
      protocolFeeBps: Number(raw.protocolFeeBps ?? 0),
      rewardBps: Number(raw.rewardBps ?? 0),
      slashBps: Number(raw.slashBps ?? 0),
      responsePeriod: Number(raw.responsePeriod ?? 0),
      evidencePeriod: Number(raw.evidencePeriod ?? 0),
      appealPeriod: Number(raw.appealPeriod ?? 0),
    };
  }

  return { config, isLoading, error };
}

// ============================================================================
// useInitiateDispute — write (payable), value = minStakeAmount
// ============================================================================

export function useInitiateDispute() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // Toasts
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Dispute initiated", {
        description:
          "Your stake has been locked. The record owner has been notified.",
      });
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError) {
      toast.error("Transaction failed", {
        description: writeError.message.slice(0, 120),
      });
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      toast.error("Confirmation failed", {
        description: confirmError.message.slice(0, 120),
      });
    }
  }, [confirmError]);

  const initiateDispute = (
    recordId: `0x${string}`,
    reason: number,
    evidenceURI: string,
    stakeValue: bigint,
  ) => {
    writeContract({
      ...routerConfig,
      functionName: "initiateDispute",
      args: [recordId, reason, evidenceURI],
      value: stakeValue,
    });
  };

  return {
    initiateDispute,
    isPending,
    isConfirming,
    isConfirmed,
    txHash,
  };
}

// ============================================================================
// useActiveDisputes — batched read: getActiveDisputes → getDispute
// ============================================================================

export interface DisputeDetail {
  disputeId: `0x${string}`;
  recordId: `0x${string}`;
  externalDisputeId: `0x${string}`;
  challenger: `0x${string}`;
  arbitrator: `0x${string}`;
  reason: number;
  status: number;
  stakeAmount: bigint;
  stakeAmountFormatted: string;
  stakeToken: `0x${string}`;
  createdAt: number;
  deadline: number;
  resolvedAt: number;
  evidenceURI: string;
  responseURI: string;
}

export function useActiveDisputes() {
  // Step 1: Fetch active dispute IDs
  const {
    data: activeIdsRaw,
    isLoading: isLoadingIds,
    error: idsError,
  } = useReadContract({
    ...routerConfig,
    functionName: "getActiveDisputes",
    args: [BigInt(0), BigInt(50)],
  });

  const activeIds = (activeIdsRaw as `0x${string}`[]) ?? [];

  // Step 2: Batch fetch individual dispute details
  const disputeContracts = activeIds.map((id) => ({
    ...routerConfig,
    functionName: "getDispute" as const,
    args: [id] as const,
  }));

  const { data: disputesRaw, isLoading: isLoadingDetails } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: disputeContracts as any[],
    query: { enabled: activeIds.length > 0 },
  });

  // Parse results
  const disputes: DisputeDetail[] = [];
  if (disputesRaw) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (disputesRaw as any[]).forEach((result: any) => {
      if (result.status === "success" && result.result) {
        const d = result.result;
        disputes.push({
          disputeId: d.disputeId,
          recordId: d.recordId,
          externalDisputeId: d.externalDisputeId,
          challenger: d.challenger,
          arbitrator: d.arbitrator,
          reason: Number(d.reason ?? 0),
          status: Number(d.status ?? 0),
          stakeAmount: d.stakeAmount ?? BigInt(0),
          stakeAmountFormatted: formatEther(d.stakeAmount ?? BigInt(0)),
          stakeToken: d.stakeToken,
          createdAt: Number(d.createdAt ?? 0),
          deadline: Number(d.deadline ?? 0),
          resolvedAt: Number(d.resolvedAt ?? 0),
          evidenceURI: d.evidenceURI ?? "",
          responseURI: d.responseURI ?? "",
        });
      }
    });
  }

  return {
    disputes,
    totalActive: activeIds.length,
    isLoading: isLoadingIds || isLoadingDetails,
    error: idsError,
  };
}
