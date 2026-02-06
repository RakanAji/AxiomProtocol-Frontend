"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  User,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  Sparkles,
  Pencil,
  X,
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
import { Label } from "@/components/ui/label";
import { WalletButton } from "@/components/WalletButton";
import { useMyIdentity } from "@/hooks/use-axiom";
import {
  useRegisterIdentity,
  useUpdateIdentity,
  useNetworkStatus,
} from "@/hooks/useAxiomContract";
import { toast } from "sonner";

export default function IdentityPage() {
  const { isConnected, address } = useAccount();
  const { isWrongNetwork } = useNetworkStatus();
  const { identity, isLoadingIdentity, refetchIdentity } = useMyIdentity();

  // Register hook
  const {
    registerIdentity,
    isPending: isRegisterPending,
    isConfirming: isRegisterConfirming,
    isConfirmed: isRegisterConfirmed,
    error: registerError,
  } = useRegisterIdentity();

  // Update hook
  const {
    updateIdentity,
    isPending: isUpdatePending,
    isConfirming: isUpdateConfirming,
    isConfirmed: isUpdateConfirmed,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateIdentity();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    proofURI: "",
  });

  // Debug log
  useEffect(() => {
    if (identity) {
      console.log("Identity Data:", identity);
    }
  }, [identity]);

  // Handle register success
  useEffect(() => {
    if (isRegisterConfirmed) {
      toast.success("Identity Registered!", {
        description: "Your on-chain identity has been created.",
      });
      refetchIdentity();
    }
  }, [isRegisterConfirmed, refetchIdentity]);

  // Handle update success
  useEffect(() => {
    if (isUpdateConfirmed) {
      toast.success("Identity Updated!", {
        description: "Your identity has been updated on-chain.",
      });
      setIsEditing(false);
      resetUpdate();
      refetchIdentity();
    }
  }, [isUpdateConfirmed, refetchIdentity, resetUpdate]);

  // Handle errors
  useEffect(() => {
    if (registerError) {
      toast.error("Registration Failed", {
        description: registerError.message.slice(0, 100),
      });
    }
  }, [registerError]);

  useEffect(() => {
    if (updateError) {
      toast.error("Update Failed", {
        description: updateError.message.slice(0, 100),
      });
    }
  }, [updateError]);

  // Populate form when entering edit mode
  const handleStartEdit = () => {
    if (identity) {
      setFormData({
        name: identity.name,
        proofURI: identity.proofURI || "",
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetUpdate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a display name");
      return;
    }

    if (isWrongNetwork) {
      toast.error("Please switch to the correct network");
      return;
    }

    await registerIdentity(formData.name, formData.proofURI);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a display name");
      return;
    }

    if (isWrongNetwork) {
      toast.error("Please switch to the correct network");
      return;
    }

    await updateIdentity(formData.name, formData.proofURI);
  };

  // Check if user has identity (registeredAt > 0)
  const hasIdentity = identity && Number(identity.registeredAt) > 0;

  // Combined loading states
  const isPending = isRegisterPending || isUpdatePending;
  const isConfirming = isRegisterConfirming || isUpdateConfirming;

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white">Your Identity</h1>
          <p className="text-white/60">
            Register your on-chain identity to build trust and credibility
          </p>
        </div>

        {/* Not Connected State */}
        {!isConnected && (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-8 rounded-3xl">
            <div className="text-center space-y-4">
              <User className="w-16 h-16 text-gray-500 mx-auto" />
              <p className="text-white/60">
                Connect your wallet to view or register your identity
              </p>
              <WalletButton />
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isConnected && isLoadingIdentity && (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-8 rounded-3xl">
            <div className="flex justify-center p-10">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          </Card>
        )}

        {/* Has Identity - Display Card */}
        {isConnected && !isLoadingIdentity && hasIdentity && !isEditing && (
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-black/40 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)]">
            <div className="space-y-6">
              {/* Identity Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {identity.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">
                      {identity.name}
                    </h2>
                    {identity.isVerified ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-300">
                          Verified
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-amber-300">Pending</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 font-mono">
                    {address?.slice(0, 8)}...{address?.slice(-6)}
                  </p>
                </div>
                {/* Edit Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  className="text-gray-400 hover:text-white"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>

              {/* Identity Details */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                {identity.proofURI && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      PROOF URI
                    </span>
                    <a
                      href={identity.proofURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:underline flex items-center gap-1 break-all"
                    >
                      {identity.proofURI}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    REGISTERED
                  </span>
                  <span className="text-sm text-gray-300">
                    {new Date(
                      Number(identity.registeredAt) * 1000,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  {identity.isVerified
                    ? "Your identity is verified and trusted"
                    : "Your identity is pending verification by protocol operators"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Edit Identity Form */}
        {isConnected && !isLoadingIdentity && hasIdentity && isEditing && (
          <Card className="border-cyan-500/30 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-cyan-400" />
                    Edit Your Identity
                  </CardTitle>
                  <CardDescription>
                    Update your display name or proof URI
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Display Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., Alice, CryptoArtist, YourCompany"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                    disabled={isPending || isConfirming}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-proofURI">Proof URI (optional)</Label>
                  <Input
                    id="edit-proofURI"
                    placeholder="https://twitter.com/yourprofile or https://yourwebsite.com"
                    value={formData.proofURI}
                    onChange={(e) =>
                      setFormData({ ...formData, proofURI: e.target.value })
                    }
                    className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                    disabled={isPending || isConfirming}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelEdit}
                    disabled={isPending || isConfirming}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                    disabled={
                      isPending ||
                      isConfirming ||
                      isWrongNetwork ||
                      !formData.name.trim()
                    }
                  >
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {isPending ? "Confirm in Wallet..." : "Updating..."}
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>

                {isWrongNetwork && (
                  <p className="text-center text-red-400 text-sm">
                    Please switch to the correct network
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* No Identity - Registration Form */}
        {isConnected && !isLoadingIdentity && !hasIdentity && (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Register Your Identity
              </CardTitle>
              <CardDescription>
                Create an on-chain identity to establish credibility
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Alice, CryptoArtist, YourCompany"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                    disabled={isPending || isConfirming}
                  />
                  <p className="text-xs text-gray-500">
                    This name will be publicly visible on-chain
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofURI">Proof URI (optional)</Label>
                  <Input
                    id="proofURI"
                    placeholder="https://twitter.com/yourprofile or https://yourwebsite.com"
                    value={formData.proofURI}
                    onChange={(e) =>
                      setFormData({ ...formData, proofURI: e.target.value })
                    }
                    className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                    disabled={isPending || isConfirming}
                  />
                  <p className="text-xs text-gray-500">
                    Link to verify your identity (social profile, website, etc.)
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 transition-opacity"
                  disabled={
                    isPending ||
                    isConfirming ||
                    isWrongNetwork ||
                    !formData.name.trim()
                  }
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {isPending ? "Confirm in Wallet..." : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      Register Identity
                    </>
                  )}
                </Button>

                {isWrongNetwork && (
                  <p className="text-center text-red-400 text-sm">
                    Please switch to the correct network
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-white/10 bg-black/20 backdrop-blur p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-white/80 mb-2">
            Why Register Your Identity?
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Build trust with content you register</li>
            <li>• Allow others to verify your authenticity</li>
            <li>• Get discovered through name resolution</li>
            <li>• Verified identities receive enhanced credibility badges</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
