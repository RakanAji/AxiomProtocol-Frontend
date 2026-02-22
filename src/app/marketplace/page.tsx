"use client";

import { useState } from "react";
import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { formatEther } from "viem";
import {
  Loader2,
  ShoppingBag,
  Tag,
  User,
  Clock,
  Shield,
  Sparkles,
  FileText,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/WalletButton";
import {
  AXIOM_ROUTER_ABI,
  AXIOM_ROUTER_ADDRESS,
} from "@/lib/contracts/axiom-router";
import { usePurchaseLicense } from "@/hooks/useLicense";

// ============================================================================
// HELPERS
// ============================================================================

const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
} as const;

/**
 * Resolve IPFS URIs to a public gateway URL.
 * Passes through normal HTTP URLs unchanged.
 */
function resolveIPFS(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  if (url.startsWith("ar://")) {
    return url.replace("ar://", "https://arweave.net/");
  }
  return url;
}

// ============================================================================
// MARKETPLACE PAGE
// ============================================================================

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const [purchasingId, setPurchasingId] = useState<bigint | null>(null);

  const { purchaseLicense, isPending, isConfirming } = usePurchaseLicense();

  // Step 1: Get total record count
  const { data: totalRecordsRaw, isLoading: isLoadingTotal } = useReadContract({
    ...routerConfig,
    functionName: "getTotalRecords",
  });

  const totalRecords = totalRecordsRaw ? Number(totalRecordsRaw) : 0;

  // Step 2: Build record indices (latest N, backwards)
  const recordCount = Math.min(totalRecords, 8);
  const recordIndices = Array.from({ length: recordCount }, (_, i) =>
    BigInt(totalRecords - 1 - i),
  );

  // Batch fetch records via useReadContracts (multicall)
  // Using explicit type annotation to avoid "Type instantiation excessively deep" with large ABIs
  const recordContracts = recordIndices.map((index) => ({
    ...routerConfig,
    functionName: "getRecordByIndex" as const,
    args: [index] as const,
  }));

  const { data: recordsRaw, isLoading: isLoadingRecords } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: recordContracts as any[],
    query: { enabled: recordCount > 0 },
  });

  // Parse records safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const records: Array<{ id: `0x${string}`; data: any; index: number }> = [];
  if (recordsRaw) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recordsRaw as any[]).forEach((result: any, i: number) => {
      if (result.status === "success" && result.result) {
        const raw = result.result;
        records.push({
          id:
            raw.contentHash ||
            (`0x${recordIndices[i].toString(16).padStart(64, "0")}` as `0x${string}`),
          data: raw,
          index: i,
        });
      }
    });
  }

  // Step 3: Batch fetch licenses for all records
  const licenseContracts = records.map((record) => ({
    ...routerConfig,
    functionName: "getLicensesByRecord" as const,
    args: [record.id] as const,
  }));

  const { data: licensesRaw, isLoading: isLoadingLicenses } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: licenseContracts as any[],
    query: { enabled: records.length > 0 },
  });

  // Step 4: For records that have licenses, batch fetch the first license info
  const firstLicenseIds: Array<{ recordIndex: number; licenseId: bigint }> = [];
  if (licensesRaw) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (licensesRaw as any[]).forEach((result: any, i: number) => {
      if (result.status === "success") {
        const ids = result.result as bigint[];
        if (ids && ids.length > 0) {
          firstLicenseIds.push({ recordIndex: i, licenseId: ids[0] });
        }
      }
    });
  }

  const licenseDetailContracts = firstLicenseIds.map(({ licenseId }) => ({
    ...routerConfig,
    functionName: "getLicense" as const,
    args: [licenseId] as const,
  }));

  const { data: licenseDetailsRaw, isLoading: isLoadingLicenseDetails } =
    useReadContracts({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contracts: licenseDetailContracts as any[],
      query: { enabled: firstLicenseIds.length > 0 },
    });

  // Build a map: recordIndex -> license detail
  const licenseMap = new Map<
    number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { licenseId: bigint; detail: any }
  >();
  if (licenseDetailsRaw) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (licenseDetailsRaw as any[]).forEach((result: any, i: number) => {
      if (result.status === "success" && result.result) {
        const { recordIndex, licenseId } = firstLicenseIds[i];
        licenseMap.set(recordIndex, { licenseId, detail: result.result });
      }
    });
  }

  const isLoading =
    isLoadingTotal ||
    isLoadingRecords ||
    isLoadingLicenses ||
    isLoadingLicenseDetails;

  const handlePurchase = (licenseId: bigint, priceWei: bigint) => {
    setPurchasingId(licenseId);
    purchaseLicense(licenseId, priceWei);
  };

  const licenseTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return "Personal";
      case 2:
        return "Commercial";
      default:
        return "Standard";
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Marketplace</h1>
          </div>
          <p className="text-white/60 max-w-lg mx-auto">
            Browse registered content and purchase licenses for authentic,
            verified digital assets
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/70">
              {totalRecords} Registered Assets
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Tag className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/70">
              {firstLicenseIds.length} Available Licenses
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            <p className="text-white/40 text-sm">Loading marketplace...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && records.length === 0 && (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-12 rounded-3xl">
            <div className="text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto" />
              <h3 className="text-xl font-semibold text-white/60">
                No Assets Available
              </h3>
              <p className="text-white/40 text-sm max-w-md mx-auto">
                No content has been registered yet. Be the first to register and
                list your content!
              </p>
            </div>
          </Card>
        )}

        {/* Asset Grid */}
        {!isLoading && records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {records.map((record, recordIndex) => {
              // Parse metadata safely
              let metadata: {
                title?: string;
                description?: string;
                fileName?: string;
                image?: string;
                fileUrl?: string;
                fileType?: string;
              } = {};
              try {
                metadata = JSON.parse(record.data?.metadataURI || "{}");
              } catch {
                // Not JSON — treat raw string as title
                if (record.data?.metadataURI) {
                  metadata = { title: record.data.metadataURI };
                }
              }

              const isActive = Number(record.data?.status) === 0;
              const timestamp = Number(record.data?.timestamp || 0);
              const licenseInfo = licenseMap.get(recordIndex);
              const hasLicense = !!licenseInfo;

              // Resolve image URL (supports ipfs://, ar://, and http(s)://)
              const imageUrl = resolveIPFS(metadata.image || metadata.fileUrl);

              return (
                <Card
                  key={record.id + recordIndex}
                  className={`overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/5 group ${
                    !isActive ? "opacity-50" : ""
                  }`}
                >
                  {/* Media Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-white/5">
                    {imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={metadata.title || "Asset"}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            // On load failure, hide the image and show fallback
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const fallback = (e.target as HTMLImageElement)
                              .nextElementSibling;
                            if (fallback)
                              (fallback as HTMLElement).style.display = "flex";
                          }}
                        />
                        {/* Hidden fallback, shown on img error */}
                        <div
                          className="absolute inset-0 items-center justify-center bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"
                          style={{ display: "none" }}
                        >
                          <FileText className="w-12 h-12 text-white/20" />
                        </div>
                      </>
                    ) : (
                      /* No image — decorative fallback */
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                          {metadata.fileType?.startsWith("image") ? (
                            <ImageIcon className="w-8 h-8 text-white/20" />
                          ) : (
                            <FileText className="w-8 h-8 text-white/20" />
                          )}
                        </div>
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">
                          {metadata.fileType || "Digital Asset"}
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Title & status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white text-base truncate flex-1">
                        {metadata.title ||
                          metadata.fileName ||
                          `Asset #${totalRecords - recordIndex}`}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {isActive ? "Active" : "Revoked"}
                      </span>
                    </div>

                    {/* Description */}
                    {metadata.description && (
                      <p className="text-sm text-white/50 line-clamp-2">
                        {metadata.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {(record.data?.issuer as string)?.slice(0, 6)}...
                        {(record.data?.issuer as string)?.slice(-4)}
                      </span>
                      {timestamp > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(timestamp * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Content hash */}
                    <div className="px-3 py-2 rounded-lg bg-white/5 font-mono text-[10px] text-white/30 truncate">
                      {record.id}
                    </div>

                    {/* License section — only show if record has licenses */}
                    {hasLicense && isActive && (
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs text-white/60">
                              {licenseTypeLabel(
                                Number(licenseInfo.detail?.licenseType),
                              )}{" "}
                              License
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {formatEther(
                              (licenseInfo.detail?.price as bigint) ||
                                BigInt(0),
                            )}{" "}
                            <span className="text-white/40 text-xs">ETH</span>
                          </span>
                        </div>

                        {/* License details */}
                        <div className="flex gap-2 flex-wrap">
                          {licenseInfo.detail?.exclusive && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">
                              Exclusive
                            </span>
                          )}
                          {Number(licenseInfo.detail?.royaltyBps) > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300">
                              {Number(licenseInfo.detail?.royaltyBps) / 100}%
                              Royalty
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300">
                            Lifetime
                          </span>
                        </div>

                        {/* Buy button */}
                        {isConnected ? (
                          <Button
                            onClick={() =>
                              handlePurchase(
                                licenseInfo.licenseId,
                                (licenseInfo.detail?.price as bigint) ||
                                  BigInt(0),
                              )
                            }
                            disabled={isPending || isConfirming}
                            className="w-full h-9 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all"
                          >
                            {purchasingId === licenseInfo.licenseId &&
                            (isPending || isConfirming) ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {isPending ? "Confirm..." : "Processing..."}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Buy License
                              </span>
                            )}
                          </Button>
                        ) : (
                          <WalletButton />
                        )}
                      </div>
                    )}

                    {/* No license available */}
                    {!hasLicense && isActive && (
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-white/30 text-center italic">
                          No license available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
