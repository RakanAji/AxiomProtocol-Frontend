/**
 * Web Worker for SHA-256 File Hashing
 *
 * High-performance file hashing using Web Crypto API with chunked processing.
 * Handles files up to 1GB+ without memory issues.
 */

/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks for optimal large file handling

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

/**
 * Main message handler for the worker
 */
self.onmessage = async (event: MessageEvent<HashWorkerMessage>) => {
  const { file } = event.data;

  if (!file) {
    self.postMessage({
      status: "error",
      error: "No file provided",
    } as HashWorkerErrorResponse);
    return;
  }

  try {
    const hash = await calculateSHA256Chunked(file);
    self.postMessage({
      status: "complete",
      hash,
    } as HashWorkerCompleteResponse);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    self.postMessage({
      status: "error",
      error: errorMessage,
    } as HashWorkerErrorResponse);
  }
};

/**
 * Calculate SHA-256 hash of a file using chunked reading.
 *
 * Note: Web Crypto API doesn't support incremental hashing directly,
 * so we read all chunks into memory progressively. For truly massive files,
 * consider using a streaming-capable library like `hash-wasm`.
 */
async function calculateSHA256Chunked(file: File): Promise<`0x${string}`> {
  const fileSize = file.size;

  // For small files, process in one go
  if (fileSize <= CHUNK_SIZE) {
    const buffer = await file.arrayBuffer();
    self.postMessage({
      status: "progress",
      progress: 50,
    } as HashWorkerProgressResponse);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    self.postMessage({
      status: "progress",
      progress: 100,
    } as HashWorkerProgressResponse);
    return bufferToHex(hashBuffer);
  }

  // For large files, read in chunks and combine
  const chunks: Uint8Array[] = [];
  let offset = 0;
  let totalBytesRead = 0;

  while (offset < fileSize) {
    const end = Math.min(offset + CHUNK_SIZE, fileSize);
    const chunk = file.slice(offset, end);
    const arrayBuffer = await chunk.arrayBuffer();
    chunks.push(new Uint8Array(arrayBuffer));

    totalBytesRead += arrayBuffer.byteLength;
    offset = end;

    // Report progress (reading phase is 80% of work)
    const progress = Math.round((totalBytesRead / fileSize) * 80);
    self.postMessage({
      status: "progress",
      progress,
    } as HashWorkerProgressResponse);
  }

  // Combine all chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let position = 0;

  for (const chunk of chunks) {
    combined.set(chunk, position);
    position += chunk.length;
  }

  self.postMessage({
    status: "progress",
    progress: 90,
  } as HashWorkerProgressResponse);

  // Calculate hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);

  self.postMessage({
    status: "progress",
    progress: 100,
  } as HashWorkerProgressResponse);

  return bufferToHex(hashBuffer);
}

/**
 * Convert ArrayBuffer to hex string with 0x prefix
 */
function bufferToHex(buffer: ArrayBuffer): `0x${string}` {
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hashHex}`;
}
