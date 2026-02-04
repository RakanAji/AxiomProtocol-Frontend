/**
 * Web Worker for SHA-256 File Hashing
 *
 * This worker calculates SHA-256 hashes for large files without blocking the main thread.
 * It processes files in chunks and reports progress back to the main thread.
 */

const CHUNK_SIZE = 64 * 1024; // 64KB chunks for optimal performance

self.onmessage = async function (e) {
  const file = e.data.file;

  if (!file) {
    self.postMessage({ type: "error", error: "No file provided" });
    return;
  }

  try {
    const hash = await calculateSHA256(file);
    self.postMessage({ type: "complete", hash });
  } catch (error) {
    self.postMessage({ type: "error", error: error.message });
  }
};

async function calculateSHA256(file) {
  const fileSize = file.size;
  let offset = 0;

  // Use SubtleCrypto for SHA-256
  // We need to read the entire file and hash it
  // For very large files, we read in chunks and update the hash incrementally

  const chunks = [];

  while (offset < fileSize) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const arrayBuffer = await chunk.arrayBuffer();
    chunks.push(new Uint8Array(arrayBuffer));

    offset += CHUNK_SIZE;

    // Report progress
    const progress = Math.min(100, Math.round((offset / fileSize) * 100));
    self.postMessage({ type: "progress", progress });
  }

  // Combine all chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let position = 0;

  for (const chunk of chunks) {
    combined.set(chunk, position);
    position += chunk.length;
  }

  // Calculate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return "0x" + hashHex;
}
