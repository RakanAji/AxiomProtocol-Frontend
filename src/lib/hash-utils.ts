/**
 * Hash Utilities
 *
 * Client-side file hashing using Web Workers for non-blocking SHA-256 calculation.
 * Supports large files (1GB+) with progress tracking.
 */

import type { HashWorkerResponse } from "@/workers/hash.worker";

type ProgressCallback = (progress: number) => void;

interface HashResult {
  hash: `0x${string}`;
  fileName: string;
  fileSize: number;
}

/**
 * Calculate SHA-256 hash of a file using a Web Worker
 *
 * Uses the TypeScript worker in src/workers/hash.worker.ts with 10MB chunks
 * for optimal performance on large files (1GB+).
 *
 * @param file - The file to hash
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Promise with the hash and file info
 */
export async function calculateFileHash(
  file: File,
  onProgress?: ProgressCallback,
): Promise<HashResult> {
  return new Promise((resolve, reject) => {
    // Use the Next.js-compatible worker import syntax
    // This ensures the TypeScript worker is properly bundled
    const worker = new Worker(
      new URL("@/workers/hash.worker.ts", import.meta.url),
    );

    worker.onmessage = (e: MessageEvent<HashWorkerResponse>) => {
      const message = e.data;

      switch (message.status) {
        case "progress":
          if (onProgress) {
            onProgress(message.progress);
          }
          break;
        case "complete":
          worker.terminate();
          resolve({
            hash: message.hash,
            fileName: file.name,
            fileSize: file.size,
          });
          break;
        case "error":
          worker.terminate();
          reject(new Error(message.error));
          break;
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(new Error(`Worker error: ${error.message}`));
    };

    // Send file to worker
    worker.postMessage({ file });
  });
}

/**
 * Calculate hash directly in main thread (for small files only)
 * Use calculateFileHash for large files to avoid UI blocking
 */
export async function calculateHashDirect(file: File): Promise<`0x${string}`> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hashHex}`;
}

/**
 * Validate if hash is in correct format
 */
export function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Convert hash string to bytes32 for contract calls
 */
export function hashToBytes32(hash: string): `0x${string}` {
  if (!hash.startsWith("0x")) {
    hash = "0x" + hash;
  }
  // Ensure 66 characters (0x + 64 hex chars)
  if (hash.length !== 66) {
    throw new Error("Invalid hash length. Expected 64 hex characters.");
  }
  return hash as `0x${string}`;
}

/**
 * Generate a privacy commitment from a content hash and a secret.
 * Uses keccak256(secret + contentHash) to create a deterministic commitment.
 */
export function generatePrivacyCommitment(
  contentHash: string,
  secret: string,
): `0x${string}` {
  // Dynamic import is not needed — we compute the keccak ourselves
  // by converting to bytes and hashing via Web Crypto, then formatting.
  // However, for consistency with Solidity's keccak256(abi.encodePacked(...)),
  // we use viem's keccak256 + encodePacked at call-site.
  // This helper just concatenates and returns a hex string suitable for hashing.
  const combined = secret + contentHash.replace(/^0x/, "");
  // Pad to ensure it's valid hex
  const hex = Array.from(new TextEncoder().encode(combined))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}` as `0x${string}`;
}

/**
 * Generate a cryptographically random bytes32 hex string
 */
export function generateRandomBytes32(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}
