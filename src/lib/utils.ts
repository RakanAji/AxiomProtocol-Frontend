import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate address for display
 * @example truncateAddress("0x1234567890abcdef1234567890abcdef12345678") => "0x1234...5678"
 */
export function truncateAddress(
  address: string,
  startChars = 6,
  endChars = 4,
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Truncate hash for display
 * @example truncateHash("0xabcdef...") => "0xabcd...ef12"
 */
export function truncateHash(
  hash: string,
  startChars = 10,
  endChars = 8,
): string {
  if (!hash) return "";
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number | bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validate file type
 */
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
];

export const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".mp4"];

export function isValidFileType(file: File): boolean {
  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  return (
    ALLOWED_FILE_TYPES.includes(file.type) ||
    ALLOWED_EXTENSIONS.includes(extension)
  );
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Convert hex string to bytes32
 */
export function hexToBytes32(hex: string): `0x${string}` {
  // Ensure it starts with 0x
  if (!hex.startsWith("0x")) {
    hex = "0x" + hex;
  }
  // Pad to 66 characters (0x + 64 hex chars)
  return hex.padEnd(66, "0") as `0x${string}`;
}
