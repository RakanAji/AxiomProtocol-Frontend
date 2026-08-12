"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RespondDisputeModal } from "@/components/RespondDisputeModal";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
  IS_AXIOM_ROUTER_CONFIGURED,
} from "@/lib/contracts/axiom-router";
import { TARGET_CHAIN_ID } from "@/lib/wagmi-config";

const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;

interface RecordDisputeActionProps {
  recordId: `0x${string}`;
}

export function RecordDisputeAction({ recordId }: RecordDisputeActionProps) {
  const [showModal, setShowModal] = useState(false);

  // Step 1: Get dispute IDs for this record
  const { data: disputeIdsRaw, refetch: refetchDisputeIds } = useReadContract({
    ...routerConfig,
    functionName: "getDisputesByRecord",
    args: [recordId],
    query: { enabled: IS_AXIOM_ROUTER_CONFIGURED },
  });

  const disputeIds = (disputeIdsRaw as `0x${string}`[]) ?? [];
  const lastDisputeId =
    disputeIds.length > 0 ? disputeIds[disputeIds.length - 1] : undefined;

  // Step 2: Get the last dispute's details
  const { data: disputeRaw, refetch: refetchDispute } = useReadContract({
    ...routerConfig,
    functionName: "getDispute",
    args: lastDisputeId ? [lastDisputeId] : undefined,
    query: { enabled: IS_AXIOM_ROUTER_CONFIGURED && !!lastDisputeId },
  });

  const dispute = disputeRaw as { status?: number | bigint } | undefined;
  const isPending = dispute && Number(dispute.status ?? 255) === 0;

  // Only render if there's a PENDING dispute
  if (!isPending || !lastDisputeId) return null;

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowModal(true)}
        className="h-7 px-2 text-xs animate-pulse"
      >
        <ShieldAlert className="w-3 h-3 mr-1" />
        Respond to Dispute
      </Button>

      {showModal && (
        <RespondDisputeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            void refetchDisputeIds();
            void refetchDispute();
          }}
          disputeId={lastDisputeId}
        />
      )}
    </>
  );
}
