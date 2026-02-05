"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { Shield, Loader2, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileDropzone, FilePreview } from "@/components/FileDropzone";
import { HashingProgress } from "@/components/HashingProgress";
import { WalletButton } from "@/components/WalletButton";
import { useAxiomRegister } from "@/hooks/use-axiom";
import { useNetworkStatus } from "@/hooks/useAxiomContract";
import { calculateFileHash } from "@/lib/hash-utils";
import { toast } from "sonner";

type RegistrationStep = "upload" | "hashing" | "metadata" | "confirm";

export default function RegisterPage() {
  const { isConnected } = useAccount();
  const { isWrongNetwork } = useNetworkStatus();
  const {
    register,
    status,
    isPending: isWritePending,
    isConfirming,
    isSuccess,
    reset,
  } = useAxiomRegister();

  // State
  const [step, setStep] = useState<RegistrationStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashProgress, setHashProgress] = useState(0);
  const [contentHash, setContentHash] = useState<`0x${string}` | null>(null);
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
  });

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setStep("hashing");
    setHashProgress(0);

    try {
      const result = await calculateFileHash(file, (progress) => {
        setHashProgress(progress);
      });

      setContentHash(result.hash as `0x${string}`);
      setStep("metadata");
      toast.success("Hash calculated successfully!");
    } catch (error) {
      console.error("Hashing error:", error);
      toast.error("Failed to calculate hash");
      setStep("upload");
    }
  }, []);

  // Handle registration
  const handleRegister = async () => {
    if (!contentHash) {
      toast.error("No content hash available");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (isWrongNetwork) {
      toast.error("Please switch to the correct network");
      return;
    }

    const metadataURI = JSON.stringify({
      title: metadata.title,
      description: metadata.description,
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      timestamp: Date.now(),
    });

    try {
      // useAxiomRegister expects `0x${string}` hash directly
      register(contentHash, metadataURI);
      setStep("confirm");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  // Reset everything
  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setHashProgress(0);
    setContentHash(null);
    setMetadata({ title: "", description: "" });
    reset();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            Register Content
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Create an immutable record of your content on the blockchain. Your
            file is hashed locally – it never leaves your device.
          </p>
        </div>

        {/* Main Content - Split View */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Dropzone */}
          <Card className="lg:row-span-2 border-white/10 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-axiom-cyan" />
                Content Upload
              </CardTitle>
              <CardDescription>
                Drop your file to generate a unique digital fingerprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "upload" && (
                <FileDropzone onFileSelect={handleFileSelect} size="large" />
              )}

              {step === "hashing" && selectedFile && (
                <HashingProgress
                  progress={hashProgress}
                  fileName={selectedFile.name}
                />
              )}

              {(step === "metadata" || step === "confirm") && selectedFile && (
                <FilePreview
                  file={selectedFile}
                  hash={contentHash || undefined}
                  onRemove={isSuccess ? undefined : handleReset}
                />
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Metadata Form */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Content Metadata</CardTitle>
              <CardDescription>
                Add optional information about your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Original Artwork #001"
                  value={metadata.title}
                  onChange={(e) =>
                    setMetadata({ ...metadata, title: e.target.value })
                  }
                  disabled={
                    step === "upload" || step === "hashing" || isSuccess
                  }
                  className="bg-white/5 border-white/10 focus:border-axiom-cyan/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your content..."
                  rows={4}
                  value={metadata.description}
                  onChange={(e) =>
                    setMetadata({ ...metadata, description: e.target.value })
                  }
                  disabled={
                    step === "upload" || step === "hashing" || isSuccess
                  }
                  className="bg-white/5 border-white/10 focus:border-axiom-cyan/50"
                />
              </div>

              {contentHash && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">Content Hash</p>
                  <p className="font-mono text-xs text-axiom-cyan break-all">
                    {contentHash}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Panel */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-md">
            <CardContent className="pt-6">
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-white/60 mb-4">
                    Connect your wallet to register content
                  </p>
                  <WalletButton />
                </div>
              ) : isSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-axiom-green/20 flex items-center justify-center animate-shield-lock">
                    <Shield className="w-8 h-8 text-axiom-green" />
                  </div>
                  <h3 className="text-xl font-bold text-axiom-green mb-2">
                    Content Registered!
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    Your content has been permanently recorded on the
                    blockchain.
                  </p>
                  <Button variant="outline" onClick={handleReset}>
                    Register Another
                  </Button>
                </div>
              ) : (
                <Button
                  size="xl"
                  className="w-full gap-2 bg-gradient-to-r from-axiom-cyan to-axiom-purple hover:opacity-90 transition-opacity"
                  onClick={handleRegister}
                  disabled={
                    !contentHash ||
                    isWritePending ||
                    isConfirming ||
                    step === "upload" ||
                    step === "hashing" ||
                    isWrongNetwork
                  }
                >
                  {isWritePending || isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isWritePending
                        ? "Confirm in Wallet..."
                        : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Mint Truth
                    </>
                  )}
                </Button>
              )}

              {isWrongNetwork && isConnected && (
                <p className="text-center text-axiom-red text-sm mt-4">
                  Please switch to the correct network to continue
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
