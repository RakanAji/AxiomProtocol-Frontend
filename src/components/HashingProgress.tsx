"use client";

import { Lock, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface HashingProgressProps {
  progress: number;
  fileName?: string;
  className?: string;
}

export function HashingProgress({
  progress,
  fileName,
  className,
}: HashingProgressProps) {
  const isComplete = progress >= 100;

  return (
    <div
      className={cn(
        "p-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md animate-slide-up",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            isComplete ? "bg-axiom-cyan/20" : "bg-axiom-purple/20",
          )}
        >
          {isComplete ? (
            <Lock className="w-5 h-5 text-axiom-cyan animate-shield-lock" />
          ) : (
            <Loader2 className="w-5 h-5 text-axiom-purple animate-spin" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-white">
            {isComplete
              ? "Digital Fingerprint Generated"
              : "Calculating Digital Fingerprint..."}
          </p>
          {fileName && (
            <p className="text-sm text-white/50 truncate max-w-[250px]">
              {fileName}
            </p>
          )}
        </div>
        <div className="text-right">
          <span
            className={cn(
              "text-2xl font-bold font-mono",
              isComplete ? "text-axiom-cyan" : "text-axiom-purple",
            )}
          >
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {!isComplete && (
        <p className="mt-3 text-xs text-white/40 text-center">
          Processing locally • Your file never leaves your device
        </p>
      )}
    </div>
  );
}
