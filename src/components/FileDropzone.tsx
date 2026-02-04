"use client";

import { useCallback, useState } from "react";
import { Upload, FileType, AlertCircle } from "lucide-react";
import {
  cn,
  isValidFileType,
  formatFileSize,
  ALLOWED_EXTENSIONS,
} from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  className?: string;
  size?: "default" | "large";
}

export function FileDropzone({
  onFileSelect,
  isProcessing = false,
  className,
  size = "default",
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setError(null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError(null);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!isValidFileType(file)) {
        setError(
          `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        );
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isValidFileType(file)) {
        setError(
          `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        );
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect],
  );

  const sizeClasses =
    size === "large" ? "min-h-[300px] md:min-h-[400px]" : "min-h-[200px]";

  return (
    <div className={cn("relative", className)}>
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
          sizeClasses,
          isDragging
            ? "border-axiom-cyan bg-axiom-cyan/10 shadow-glow-cyan"
            : "border-white/20 bg-black/40 backdrop-blur-md hover:border-white/40 hover:bg-white/5",
          isProcessing && "pointer-events-none opacity-60",
          error && "border-axiom-red",
        )}
      >
        <input
          type="file"
          className="hidden"
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={handleFileInput}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center p-8 text-center">
          {isDragging ? (
            <>
              <div className="w-16 h-16 mb-4 rounded-full bg-axiom-cyan/20 flex items-center justify-center animate-pulse">
                <Upload className="w-8 h-8 text-axiom-cyan" />
              </div>
              <p className="text-lg font-medium text-axiom-cyan">
                Release to upload
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mb-4 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <FileType className="w-8 h-8 text-white/70" />
              </div>
              <p className="text-lg font-medium text-white mb-2">
                Drop your file here
              </p>
              <p className="text-sm text-white/50 mb-4">or click to browse</p>
              <div className="flex flex-wrap justify-center gap-2">
                {ALLOWED_EXTENSIONS.map((ext) => (
                  <span
                    key={ext}
                    className="px-2 py-1 text-xs rounded bg-white/10 text-white/70"
                  >
                    {ext.toUpperCase()}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </label>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-axiom-red text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// File preview component
interface FilePreviewProps {
  file: File;
  hash?: string;
  onRemove?: () => void;
}

export function FilePreview({ file, hash, onRemove }: FilePreviewProps) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-axiom-purple/20 flex items-center justify-center">
            <FileType className="w-5 h-5 text-axiom-purple" />
          </div>
          <div>
            <p className="font-medium text-white truncate max-w-[200px]">
              {file.name}
            </p>
            <p className="text-sm text-white/50">{formatFileSize(file.size)}</p>
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {hash && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-white/50 mb-1">
            Digital Fingerprint (SHA-256)
          </p>
          <p className="font-mono text-xs text-axiom-cyan break-all">{hash}</p>
        </div>
      )}
    </div>
  );
}
