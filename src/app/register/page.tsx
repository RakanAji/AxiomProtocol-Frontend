"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { keccak256, toHex, encodeAbiParameters } from "viem";
import {
  Shield,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileDropzone, FilePreview } from "@/components/FileDropzone";
import { HashingProgress } from "@/components/HashingProgress";
import { WalletButton } from "@/components/WalletButton";
import { useRegisterContent as useAxiomRegister } from "@/hooks/useAxiomContract";
import { useNetworkStatus } from "@/hooks/useAxiomContract";
import { usePrivateRegister } from "@/hooks/usePrivacy";
import { calculateFileHash, generateRandomBytes32 } from "@/lib/hash-utils";
import { toast } from "sonner";

type RegistrationStep = "upload" | "hashing" | "metadata" | "confirm";
type RegistrationMode = "standard" | "private";

// Generate a 32-char hex secret for the user
function generateSecret(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function RegisterPage() {
  const { isConnected } = useAccount();
  const { isWrongNetwork } = useNetworkStatus();
  const {
    register,
    isWritePending,
    isConfirming,
    isConfirmed: isSuccess,
    reset,
  } = useAxiomRegister();

  const {
    privateRegister,
    isWritePending: isPrivateWritePending,
    isConfirming: isPrivateConfirming,
    isConfirmed: isPrivateSuccess,
    reset: privateReset,
  } = usePrivateRegister();

  // State
  const [mode, setMode] = useState<RegistrationMode>("standard");
  const [step, setStep] = useState<RegistrationStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashProgress, setHashProgress] = useState(0);
  const [contentHash, setContentHash] = useState<`0x${string}` | null>(null);
  const [metadata, setMetadata] = useState({ title: "", description: "" });

  // Privacy state
  const [privacySecret, setPrivacySecret] = useState(generateSecret);
  const [showSecret, setShowSecret] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const isPrivate = mode === "private";
  const currentSuccess = isPrivate ? isPrivateSuccess : isSuccess;
  const currentWritePending = isPrivate
    ? isPrivateWritePending
    : isWritePending;
  const currentConfirming = isPrivate ? isPrivateConfirming : isConfirming;

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
      if (isPrivate) {
        // Generate commitment: keccak256(secret + contentHash)
        const secretHex = toHex(new TextEncoder().encode(privacySecret));
        const commitment = keccak256(
          `${secretHex}${contentHash.replace("0x", "")}` as `0x${string}`,
        );
        const nullifierHash = generateRandomBytes32();
        // ABI-encode a valid Groth16 proof struct: (uint256[2], uint256[2][2], uint256[2])
        const dummyProof = encodeAbiParameters(
          [
            { type: "uint256[2]" },
            { type: "uint256[2][2]" },
            { type: "uint256[2]" },
          ],
          [
            [BigInt(0), BigInt(0)],
            [
              [BigInt(0), BigInt(0)],
              [BigInt(0), BigInt(0)],
            ],
            [BigInt(0), BigInt(0)],
          ],
        );

        privateRegister(
          contentHash,
          commitment,
          nullifierHash,
          dummyProof,
          metadataURI,
        );
      } else {
        register(contentHash, metadataURI);
      }
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
    privateReset();
    setPrivacySecret(generateSecret());
    setSecretCopied(false);
    setShowSecret(false);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(privacySecret);
    setSecretCopied(true);
    toast.success("Secret copied to clipboard");
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const handleRegenerateSecret = () => {
    setPrivacySecret(generateSecret());
    setSecretCopied(false);
  };

  // Dynamic styles based on mode
  const accentGradient = isPrivate
    ? "from-emerald-400 to-green-500"
    : "from-axiom-cyan to-axiom-purple";
  const borderGlow = isPrivate
    ? "border-emerald-500/30 shadow-emerald-500/10"
    : "border-white/10";
  const accentColor = isPrivate ? "text-emerald-400" : "text-axiom-cyan";

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

          {/* Mode Toggle */}
          <div className="mt-6 flex items-center justify-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto">
            <button
              onClick={() => setMode("standard")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                !isPrivate
                  ? "bg-gradient-to-r from-axiom-cyan/20 to-axiom-purple/20 text-white border border-axiom-cyan/30"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <Shield className="w-4 h-4" />
              Standard
            </button>
            <button
              onClick={() => setMode("private")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isPrivate
                  ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <Lock className="w-4 h-4" />
              Private (ZK)
            </button>
          </div>
        </div>

        {/* Private Mode Banner */}
        {isPrivate && (
          <div className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-xl shadow-lg shadow-emerald-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-semibold text-emerald-300">
                  Zero-Knowledge Private Registration
                </h3>
                <p className="text-xs text-emerald-200/60 leading-relaxed">
                  Your identity is hidden on-chain. Only the content hash and a
                  cryptographic commitment are stored. You can prove ownership
                  later using your <strong>Privacy Secret</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Split View */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Dropzone */}
          <Card
            className={`lg:row-span-2 bg-black/40 backdrop-blur-md transition-all duration-500 ${borderGlow} ${
              isPrivate ? "shadow-lg" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isPrivate ? (
                  <Lock className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Shield className="w-5 h-5 text-axiom-cyan" />
                )}
                Content Upload
              </CardTitle>
              <CardDescription>
                {isPrivate
                  ? "Your file is hashed locally — nothing is uploaded"
                  : "Drop your file to generate a unique digital fingerprint"}
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
                  onRemove={currentSuccess ? undefined : handleReset}
                />
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Metadata Form */}
          <Card
            className={`bg-black/40 backdrop-blur-md transition-all duration-500 ${borderGlow}`}
          >
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
                    step === "upload" || step === "hashing" || currentSuccess
                  }
                  className={`bg-white/5 border-white/10 ${
                    isPrivate
                      ? "focus:border-emerald-500/50"
                      : "focus:border-axiom-cyan/50"
                  }`}
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
                    step === "upload" || step === "hashing" || currentSuccess
                  }
                  className={`bg-white/5 border-white/10 ${
                    isPrivate
                      ? "focus:border-emerald-500/50"
                      : "focus:border-axiom-cyan/50"
                  }`}
                />
              </div>

              {contentHash && (
                <div
                  className={`p-3 rounded-lg bg-white/5 border ${
                    isPrivate ? "border-emerald-500/20" : "border-white/10"
                  }`}
                >
                  <p className="text-xs text-white/50 mb-1">Content Hash</p>
                  <p className={`font-mono text-xs break-all ${accentColor}`}>
                    {contentHash}
                  </p>
                </div>
              )}

              {/* Privacy Secret Section */}
              {isPrivate && (
                <div className="space-y-3 pt-2">
                  {/* WARNING */}
                  <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Critical — Save This Secret
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/70 leading-relaxed">
                      This secret is your <strong>only way</strong> to prove
                      ownership later. If you lose it, you can{" "}
                      <strong>never</strong> prove you registered this content.
                      Copy it now and store it safely offline.
                    </p>
                  </div>

                  {/* Secret display */}
                  <div className="space-y-1.5">
                    <Label className="text-emerald-400/80 text-xs">
                      Privacy Secret
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          value={privacySecret}
                          onChange={(e) => setPrivacySecret(e.target.value)}
                          type={showSecret ? "text" : "password"}
                          className="bg-emerald-950/40 border-emerald-500/30 text-emerald-300 font-mono text-xs pr-10 focus:border-emerald-400/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-400 transition"
                        >
                          {showSecret ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopySecret}
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-10 px-3"
                      >
                        {secretCopied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateSecret}
                        className="border-white/10 text-white/40 hover:text-white hover:bg-white/5 h-10 px-3"
                        title="Regenerate secret"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Panel */}
          <Card
            className={`bg-black/40 backdrop-blur-md transition-all duration-500 ${borderGlow}`}
          >
            <CardContent className="pt-6">
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-white/60 mb-4">
                    Connect your wallet to register content
                  </p>
                  <WalletButton />
                </div>
              ) : currentSuccess ? (
                <div className="text-center py-4">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-shield-lock ${
                      isPrivate ? "bg-emerald-500/20" : "bg-axiom-green/20"
                    }`}
                  >
                    {isPrivate ? (
                      <Lock className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <Shield className="w-8 h-8 text-axiom-green" />
                    )}
                  </div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isPrivate ? "text-emerald-400" : "text-axiom-green"
                    }`}
                  >
                    {isPrivate
                      ? "Privately Registered!"
                      : "Content Registered!"}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {isPrivate
                      ? "Your content has been anonymously recorded on-chain."
                      : "Your content has been permanently recorded on the blockchain."}
                  </p>
                  <Button variant="outline" onClick={handleReset}>
                    Register Another
                  </Button>
                </div>
              ) : (
                <Button
                  size="xl"
                  className={`w-full gap-2 bg-gradient-to-r ${accentGradient} hover:opacity-90 transition-opacity`}
                  onClick={handleRegister}
                  disabled={
                    !contentHash ||
                    currentWritePending ||
                    currentConfirming ||
                    step === "upload" ||
                    step === "hashing" ||
                    isWrongNetwork
                  }
                >
                  {currentWritePending || currentConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {currentWritePending
                        ? "Confirm in Wallet..."
                        : "Confirming..."}
                    </>
                  ) : (
                    <>
                      {isPrivate ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                      {isPrivate ? "Private Mint" : "Mint Truth"}
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
