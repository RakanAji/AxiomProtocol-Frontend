"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ImageIcon,
  Loader2,
  Shield,
  ShoppingBag,
  Sparkles,
  Tag,
  User,
} from "lucide-react";

import { WalletButton } from "@/components/WalletButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  parseLicense,
  usePurchaseLicense,
  type LicenseInfo,
} from "@/hooks/useLicense";
import {
  contentStatusLabel,
  formatLicensePrice,
  isLicenseTemplateAvailable,
  isNativeToken,
  licenseExpiryLabel,
  licenseTypeLabel,
  parseContentMetadata,
  resolveContentUri,
  shortAddress,
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

const PAGE_SIZE = 6;
const routerConfig = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;

interface RecordData {
  issuer: `0x${string}`;
  timestamp: number;
  status: number;
  algorithm: number;
  contentHash: `0x${string}`;
  metadataURI: string;
}

interface ReadResult {
  status: "success" | "failure";
  result?: unknown;
  error?: Error;
}

interface MarketplaceRecord {
  id: `0x${string}`;
  data: RecordData;
  licenses: Array<{ id: bigint; data: LicenseInfo }>;
}

function parseRecord(raw: unknown): RecordData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as Record<string, unknown>;
  if (!value.issuer || !value.contentHash) return undefined;
  return {
    issuer: value.issuer as `0x${string}`,
    timestamp: Number(value.timestamp ?? 0),
    status: Number(value.status ?? 0),
    algorithm: Number(value.algorithm ?? 0),
    contentHash: value.contentHash as `0x${string}`,
    metadataURI: String(value.metadataURI ?? ""),
  };
}

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const [page, setPage] = useState(0);
  const [purchasingId, setPurchasingId] = useState<bigint | null>(null);
  const purchase = usePurchaseLicense();

  const totalQuery = useReadContract({
    ...routerConfig,
    functionName: "getTotalRecords",
    query: { enabled: IS_AXIOM_ROUTER_CONFIGURED, staleTime: 15_000 },
  });
  const totalRecords = Number(totalQuery.data ?? BigInt(0));
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const pageOffset = Math.max(totalRecords - (page + 1) * PAGE_SIZE, 0);
  const pageLimit = Math.max(
    0,
    Math.min(PAGE_SIZE, totalRecords - page * PAGE_SIZE),
  );

  useEffect(() => {
    if (page >= totalPages) setPage(totalPages - 1);
  }, [page, totalPages]);

  const idsQuery = useReadContract({
    ...routerConfig,
    functionName: "getRecordIds",
    args: [BigInt(pageOffset), BigInt(pageLimit)],
    query: {
      enabled: IS_AXIOM_ROUTER_CONFIGURED && pageLimit > 0,
      staleTime: 15_000,
    },
  });
  const recordIds = useMemo(
    () =>
      [...((idsQuery.data as readonly `0x${string}`[] | undefined) ?? [])].reverse(),
    [idsQuery.data],
  );

  const recordReads = useReadContracts({
    contracts: recordIds.map((recordId) => ({
      ...routerConfig,
      functionName: "getRecord" as const,
      args: [recordId] as const,
    })),
    query: { enabled: recordIds.length > 0, staleTime: 15_000 },
  });
  const recordResults = (recordReads.data ?? []) as readonly ReadResult[];
  const parsedRecords = recordIds.flatMap((id, index) => {
    const result = recordResults[index];
    const record = result?.status === "success" ? parseRecord(result.result) : undefined;
    return record ? [{ id, data: record }] : [];
  });

  const licenseIdReads = useReadContracts({
    contracts: parsedRecords.map((record) => ({
      ...routerConfig,
      functionName: "getLicensesByRecord" as const,
      args: [record.id] as const,
    })),
    query: { enabled: parsedRecords.length > 0, staleTime: 15_000 },
  });
  const licenseIdResults = (licenseIdReads.data ?? []) as readonly ReadResult[];
  const licenseRefs = parsedRecords.flatMap((record, recordIndex) => {
    const result = licenseIdResults[recordIndex];
    const ids =
      result?.status === "success"
        ? ((result.result as readonly bigint[] | undefined) ?? [])
        : [];
    return ids.map((licenseId) => ({ recordId: record.id, licenseId }));
  });

  const licenseReads = useReadContracts({
    contracts: licenseRefs.map(({ licenseId }) => ({
      ...routerConfig,
      functionName: "getLicense" as const,
      args: [licenseId] as const,
    })),
    query: { enabled: licenseRefs.length > 0, staleTime: 15_000 },
  });
  const licenseResults = (licenseReads.data ?? []) as readonly ReadResult[];
  const nowSeconds = Math.floor(Date.now() / 1000);
  const validLicenses = licenseRefs.flatMap((reference, index) => {
    const result = licenseResults[index];
    const license = result?.status === "success" ? parseLicense(result.result) : undefined;
    return license &&
      isLicenseTemplateAvailable(
        license.active,
        license.exclusive,
        license.licensee,
        license.validUntil,
        nowSeconds,
      )
      ? [{ ...reference, data: license }]
      : [];
  });

  const tokenAddresses = Array.from(
    new Set(
      validLicenses
        .map((license) => license.data.paymentToken)
        .filter((address) => !isNativeToken(address)),
    ),
  );
  const tokenReads = useReadContracts({
    contracts: tokenAddresses.flatMap((address) => [
      {
        address,
        abi: ERC20_ABI,
        chainId: TARGET_CHAIN_ID,
        functionName: "decimals" as const,
      },
      {
        address,
        abi: ERC20_ABI,
        chainId: TARGET_CHAIN_ID,
        functionName: "symbol" as const,
      },
    ]),
    query: { enabled: tokenAddresses.length > 0, staleTime: Infinity },
  });
  const tokenResults = (tokenReads.data ?? []) as readonly ReadResult[];
  const tokenMetadata = new Map<string, TokenMetadata>();
  tokenAddresses.forEach((address, index) => {
    const decimals = tokenResults[index * 2];
    const symbol = tokenResults[index * 2 + 1];
    if (decimals?.status === "success" && symbol?.status === "success") {
      tokenMetadata.set(address.toLowerCase(), {
        decimals: Number(decimals.result),
        symbol: String(symbol.result),
      });
    }
  });

  const records: MarketplaceRecord[] = parsedRecords.map((record) => ({
    ...record,
    licenses: validLicenses
      .filter((license) => license.recordId === record.id)
      .map((license) => ({ id: license.licenseId, data: license.data })),
  }));

  const isLoading =
    totalQuery.isLoading ||
    idsQuery.isLoading ||
    recordReads.isLoading ||
    licenseIdReads.isLoading ||
    licenseReads.isLoading ||
    tokenReads.isLoading;
  const queryError =
    totalQuery.error ||
    idsQuery.error ||
    recordReads.error ||
    licenseIdReads.error ||
    licenseReads.error ||
    tokenReads.error;
  const partialFailure = [
    ...recordResults,
    ...licenseIdResults,
    ...licenseResults,
    ...tokenResults,
  ].some((result) => result.status === "failure");
  const isPurchaseBusy = purchase.isPending || purchase.isConfirming;
  const refetchLicenses = licenseReads.refetch;

  useEffect(() => {
    if (!purchase.isSuccess) return;
    setPurchasingId(null);
    void refetchLicenses();
  }, [purchase.isSuccess, refetchLicenses]);

  const handlePurchase = (licenseId: bigint, license: LicenseInfo) => {
    setPurchasingId(licenseId);
    void purchase.purchaseLicense({
      licenseId,
      price: license.price,
      paymentToken: license.paymentToken,
      duration: 0,
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Marketplace</h1>
          </div>
          <p className="mx-auto max-w-xl text-white/60">
            Browse canonical registry records and currently purchasable license
            templates. A license purchase mints the on-chain license NFT.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Stat icon={Shield} label={`${totalRecords} registered records`} />
          <Stat
            icon={Tag}
            label={`${validLicenses.length} available on this page`}
          />
        </div>

        {!IS_AXIOM_ROUTER_CONFIGURED && (
          <ErrorCard message={ROUTER_CONFIGURATION_ERROR || "Router is not configured"} />
        )}
        {queryError && <ErrorCard message={queryError.message} />}
        {partialFailure && !queryError && (
          <ErrorCard message="Some on-chain records could not be loaded. Refresh before purchasing." />
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
            <p className="text-sm text-white/40">Loading on-chain marketplace…</p>
          </div>
        )}

        {!isLoading && !queryError && totalRecords === 0 && IS_AXIOM_ROUTER_CONFIGURED && (
          <Card className="rounded-3xl border-white/10 bg-black/40 p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-white/20" />
            <h2 className="text-xl font-semibold text-white/70">No records yet</h2>
            <p className="mt-2 text-sm text-white/40">
              Register content first, then create a license from its profile card.
            </p>
          </Card>
        )}

        {!isLoading && records.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record, index) => (
              <AssetCard
                key={record.id}
                record={record}
                fallbackNumber={totalRecords - page * PAGE_SIZE - index}
                isConnected={isConnected}
                isPurchaseBusy={isPurchaseBusy}
                purchasingId={purchasingId}
                purchasePhase={purchase.phase}
                tokenMetadata={tokenMetadata}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        )}

        {totalRecords > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || isLoading}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Newer
            </Button>
            <span className="text-sm text-white/50">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages || isLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              Older <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({
  record,
  fallbackNumber,
  isConnected,
  isPurchaseBusy,
  purchasingId,
  purchasePhase,
  tokenMetadata,
  onPurchase,
}: {
  record: MarketplaceRecord;
  fallbackNumber: number;
  isConnected: boolean;
  isPurchaseBusy: boolean;
  purchasingId: bigint | null;
  purchasePhase: string;
  tokenMetadata: Map<string, TokenMetadata>;
  onPurchase: (licenseId: bigint, license: LicenseInfo) => void;
}) {
  const metadata = parseContentMetadata(record.data.metadataURI);
  const imageUrl = resolveContentUri(metadata.image || metadata.fileUrl);
  const isActive = record.data.status === 0;

  return (
    <Card className={`overflow-hidden rounded-2xl border-white/10 bg-black/40 ${!isActive ? "opacity-60" : ""}`}>
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={metadata.title || metadata.fileName || "Registered content"}
            className="h-full w-full object-cover"
          />
        ) : metadata.fileType?.startsWith("image") ? (
          <ImageIcon className="h-12 w-12 text-white/20" />
        ) : (
          <FileText className="h-12 w-12 text-white/20" />
        )}
      </div>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate font-semibold text-white">
            {metadata.title || metadata.fileName || `Record #${fallbackNumber}`}
          </h2>
          <span className="shrink-0 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/65">
            {contentStatusLabel(record.data.status)}
          </span>
        </div>
        {metadata.description && (
          <p className="line-clamp-2 text-sm text-white/50">{metadata.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" /> {shortAddress(record.data.issuer)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(record.data.timestamp * 1000).toLocaleDateString()}
          </span>
        </div>
        <div title={record.id} className="truncate rounded-lg bg-white/5 px-3 py-2 font-mono text-[10px] text-white/35">
          Record ID: {record.id}
        </div>

        {isActive && record.licenses.length > 0 ? (
          <div className="space-y-3 border-t border-white/10 pt-3">
            {record.licenses.map(({ id, data }) => {
              const token = tokenMetadata.get(data.paymentToken.toLowerCase());
              const thisPurchase = purchasingId === id && isPurchaseBusy;
              return (
                <div key={id.toString()} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm text-white/80">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        {licenseTypeLabel(data.licenseType)}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {licenseExpiryLabel(data.validUntil)}
                        {data.exclusive ? " · Exclusive" : ""}
                        {data.sublicensable ? " · Sublicensable" : ""}
                      </p>
                    </div>
                    <p className="text-right text-sm font-semibold text-white">
                      {formatLicensePrice(data.price, data.paymentToken, token)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-white/35">
                    <span>{data.royaltyBps / 100}% royalty</span>
                    {!isNativeToken(data.paymentToken) && !token && (
                      <span className="text-amber-300">Token metadata unavailable</span>
                    )}
                  </div>
                  <div className="mt-3">
                    {isConnected ? (
                      <Button
                        className="h-9 w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-sm"
                        disabled={isPurchaseBusy || (!isNativeToken(data.paymentToken) && !token)}
                        onClick={() => onPurchase(id, data)}
                      >
                        {thisPurchase ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {purchasePhase === "approving"
                              ? "Approving token…"
                              : purchasePhase === "confirming"
                                ? "Confirming purchase…"
                                : "Preparing purchase…"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ShoppingBag className="h-3.5 w-3.5" /> Buy license
                          </span>
                        )}
                      </Button>
                    ) : (
                      <WalletButton />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : isActive ? (
          <p className="border-t border-white/10 pt-3 text-center text-xs italic text-white/30">
            No currently purchasable licenses
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
      <Icon className="h-4 w-4 text-cyan-400" />
      <span className="text-sm text-white/70">{label}</span>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="rounded-2xl border-red-500/30 bg-red-950/30 p-5">
      <p className="flex items-start gap-2 break-words text-sm text-red-200">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
      </p>
    </Card>
  );
}
