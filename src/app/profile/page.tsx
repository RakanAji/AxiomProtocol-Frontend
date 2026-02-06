"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import {
  User,
  FileText,
  Loader2,
  Clock,
  CheckCircle2,
  Search,
  Ban,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletButton } from "@/components/WalletButton";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { useMyIdentity, useIdentity } from "@/hooks/use-axiom";
import { useRevokeContent } from "@/hooks/useAxiomContract";
import { toast } from "sonner";

export default function ProfilePage() {
  const { isConnected, address } = useAccount();
  const { identity: myIdentity, isLoadingIdentity } = useMyIdentity();
  const [searchAddress, setSearchAddress] = useState<string>("");
  const [viewingAddress, setViewingAddress] = useState<`0x${string}` | null>(
    null,
  );
  const [revokingId, setRevokingId] = useState<`0x${string}` | null>(null);

  // Revoke hook
  const {
    revoke,
    isPending: isRevokePending,
    isConfirming: isRevokeConfirming,
    isConfirmed: isRevokeConfirmed,
    error: revokeError,
  } = useRevokeContent();

  // Determine which address to show records for
  const targetAddress = viewingAddress || address;
  const isOwnProfile = !viewingAddress || viewingAddress === address;

  // Fetch identity for target address
  const { identity: targetIdentity } = useIdentity({
    address: viewingAddress || undefined,
  });
  const displayIdentity = isOwnProfile ? myIdentity : targetIdentity;

  // Fetch record IDs for the target address
  const {
    data: recordIds,
    isLoading: isLoadingRecords,
    refetch: refetchRecords,
  } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "getRecordsByIssuer",
    args: targetAddress ? [targetAddress] : undefined,
    query: { enabled: !!targetAddress },
  });

  // Fetch all records in parallel
  const recordContracts =
    (recordIds as `0x${string}`[])?.map((id) => ({
      address: AXIOM_ROUTER_ADDRESS,
      abi: AXIOM_ROUTER_ABI,
      functionName: "getRecord" as const,
      args: [id] as const,
    })) || [];

  const {
    data: recordsData,
    isLoading: isLoadingRecordDetails,
    refetch: refetchRecordDetails,
  } = useReadContracts({
    contracts: recordContracts,
    query: { enabled: recordContracts.length > 0 },
  });

  // Handle revoke success
  useEffect(() => {
    if (isRevokeConfirmed) {
      toast.success("Content Revoked!", {
        description: "The content has been revoked successfully.",
      });
      setRevokingId(null);
      // Refetch records to update UI
      refetchRecords();
      refetchRecordDetails();
    }
  }, [isRevokeConfirmed, refetchRecords, refetchRecordDetails]);

  // Handle revoke error
  useEffect(() => {
    if (revokeError) {
      toast.error("Revoke Failed", {
        description: revokeError.message.slice(0, 100),
      });
      setRevokingId(null);
    }
  }, [revokeError]);

  const handleRevoke = async (recordId: `0x${string}`) => {
    setRevokingId(recordId);
    await revoke(recordId, "User requested revocation");
  };

  const handleSearch = () => {
    if (/^0x[a-fA-F0-9]{40}$/.test(searchAddress)) {
      setViewingAddress(searchAddress as `0x${string}`);
    }
  };

  const handleViewOwn = () => {
    setViewingAddress(null);
    setSearchAddress("");
  };

  // Check if identity exists
  const hasIdentity =
    displayIdentity && Number(displayIdentity.registeredAt) > 0;

  // Parse records
  const records = (recordsData || [])
    .map((result, index) => {
      if (result.status !== "success") return null;
      const data = result.result as {
        issuer: `0x${string}`;
        timestamp: number | bigint;
        status: number;
        algorithm: number;
        contentHash: `0x${string}`;
        metadataURI: string;
      };
      return {
        id: (recordIds as `0x${string}`[])?.[index],
        ...data,
      };
    })
    .filter(Boolean);

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white">
            {isOwnProfile ? "My Profile" : "Profile"}
          </h1>
          <p className="text-white/60">
            View registered content and identity information
          </p>
        </div>

        {/* Search Other Profiles */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-4 rounded-2xl">
          <div className="flex gap-3">
            <Input
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Search by wallet address (0x...)"
              className="flex-1 bg-white/5 border-white/10"
            />
            <Button
              onClick={handleSearch}
              disabled={!/^0x[a-fA-F0-9]{40}$/.test(searchAddress)}
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            {viewingAddress && (
              <Button onClick={handleViewOwn} variant="ghost">
                View My Profile
              </Button>
            )}
          </div>
        </Card>

        {/* Not Connected State */}
        {!isConnected && !viewingAddress && (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-8 rounded-3xl">
            <div className="text-center space-y-4">
              <User className="w-16 h-16 text-gray-500 mx-auto" />
              <p className="text-white/60">
                Connect your wallet to view your profile
              </p>
              <WalletButton />
            </div>
          </Card>
        )}

        {/* Loading State */}
        {(isLoadingIdentity || isLoadingRecords) && (
          <div className="flex justify-center p-10">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Profile Card */}
        {targetAddress && !isLoadingIdentity && (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {hasIdentity
                      ? displayIdentity!.name.charAt(0).toUpperCase()
                      : targetAddress.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">
                      {hasIdentity ? displayIdentity!.name : "Anonymous"}
                    </CardTitle>
                    {hasIdentity && displayIdentity!.isVerified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-emerald-300">
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {targetAddress}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-3xl font-bold text-white">
                    {records.length}
                  </p>
                  <p className="text-sm text-gray-400">Registered Content</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-3xl font-bold text-white">
                    {hasIdentity
                      ? new Date(
                          Number(displayIdentity!.registeredAt) * 1000,
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                  <p className="text-sm text-gray-400">Member Since</p>
                </div>
              </div>

              {!hasIdentity && isOwnProfile && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-amber-200 text-sm text-center">
                    You haven&apos;t registered your identity yet.{" "}
                    <Link
                      href="/identity"
                      className="text-amber-400 hover:underline"
                    >
                      Register now →
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Registered Content List */}
        {targetAddress && !isLoadingRecords && !isLoadingRecordDetails && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Registered Content ({records.length})
            </h2>

            {records.length === 0 ? (
              <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-8 rounded-2xl">
                <p className="text-center text-gray-400">
                  No content registered yet.
                  {isOwnProfile && (
                    <>
                      {" "}
                      <Link
                        href="/register"
                        className="text-cyan-400 hover:underline"
                      >
                        Register your first content →
                      </Link>
                    </>
                  )}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {records.map((record, index) => {
                  let metadata: {
                    title?: string;
                    description?: string;
                    fileName?: string;
                  } = {};
                  try {
                    metadata = JSON.parse(record!.metadataURI || "{}");
                  } catch {
                    // Not JSON, use as-is
                  }

                  const isRevoking = revokingId === record!.id;
                  const isActive = record!.status === 0;

                  return (
                    <Card
                      key={record!.id || index}
                      className={`border-white/10 bg-black/40 backdrop-blur-xl p-4 rounded-xl transition-all ${
                        isActive ? "hover:border-cyan-500/30" : "opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {metadata.title ||
                              metadata.fileName ||
                              `Record #${index + 1}`}
                          </h3>
                          {metadata.description && (
                            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                              {metadata.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(
                                Number(record!.timestamp) * 1000,
                              ).toLocaleString()}
                            </span>
                            <span className="font-mono truncate max-w-[200px]">
                              {record!.contentHash.slice(0, 10)}...
                              {record!.contentHash.slice(-8)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              isActive
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {isActive ? "Active" : "Revoked"}
                          </span>

                          {/* Revoke Button - Only for own profile and active records */}
                          {isOwnProfile && isActive && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevoke(record!.id!)}
                              disabled={isRevokePending || isRevokeConfirming}
                              className="h-7 px-2 text-xs"
                            >
                              {isRevoking ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Ban className="w-3 h-3 mr-1" />
                                  Revoke
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
