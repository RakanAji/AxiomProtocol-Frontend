/**
 * Web Worker for SHA-256 File Hashing using hash-wasm
 * * Optimized for low memory usage via streaming/incremental hashing.
 */

/// <reference lib="webworker" />

// Import createSHA256 from hash-wasm
// Note: Next.js handling of workers might require specific import depending on config,
// but usually standard import works if treating worker as module.
import { createSHA256 } from "hash-wasm";

declare const self: DedicatedWorkerGlobalScope;

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

export interface HashWorkerMessage {
  file: File;
}

export interface HashWorkerProgressResponse {
  status: "progress";
  progress: number;
}

export interface HashWorkerCompleteResponse {
  status: "complete";
  hash: `0x${string}`;
}

export interface HashWorkerErrorResponse {
  status: "error";
  error: string;
}

export type HashWorkerResponse =
  | HashWorkerProgressResponse
  | HashWorkerCompleteResponse
  | HashWorkerErrorResponse;

self.onmessage = async (event: MessageEvent<HashWorkerMessage>) => {
  const { file } = event.data;

  if (!file) {
    self.postMessage({ status: "error", error: "No file provided" });
    return;
  }

  try {
    const hash = await calculateSHA256Streaming(file);
    self.postMessage({ status: "complete", hash: `0x${hash}` });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    self.postMessage({ status: "error", error: errorMessage });
  }
};

async function calculateSHA256Streaming(file: File): Promise<string> {
  const fileSize = file.size;
  // Inisialisasi hasher dari hash-wasm
  const hasher = await createSHA256();

  hasher.init();

  let offset = 0;

  while (offset < fileSize) {
    const end = Math.min(offset + CHUNK_SIZE, fileSize);
    const chunkBlob = file.slice(offset, end);
    const chunkBuffer = await chunkBlob.arrayBuffer();

    // Convert ArrayBuffer to Uint8Array required by hash-wasm
    const view = new Uint8Array(chunkBuffer);

    // Update hash state incremental (Memory usage stays low!)
    hasher.update(view);

    offset = end;

    // Report progress
    const progress = Math.round((offset / fileSize) * 100);
    self.postMessage({ status: "progress", progress });
  }

  // Finalize and get hex string
  const hashHex = hasher.digest();
  return hashHex;
}
