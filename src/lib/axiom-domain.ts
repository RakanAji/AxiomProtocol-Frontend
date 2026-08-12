import {
  encodePacked,
  formatEther,
  formatUnits,
  isAddress,
  isHex,
  keccak256,
} from "viem";

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

export const CONTENT_STATUSES = {
  0: "Active",
  1: "Revoked",
  2: "Disputed",
} as const satisfies Record<number, string>;

export const LICENSE_TYPES = {
  0: "None",
  1: "CC0",
  2: "CC BY",
  3: "CC BY-SA",
  4: "CC BY-NC",
  5: "CC BY-NC-SA",
  6: "CC BY-ND",
  7: "CC BY-NC-ND",
  8: "Commercial Single",
  9: "Commercial Unlimited",
  10: "Exclusive",
  11: "Custom",
} as const satisfies Record<number, string>;

export const DISPUTE_REASONS = {
  0: "Copyright infringement",
  1: "False attribution",
  2: "Harmful content",
  3: "Duplicate registration",
  4: "Fraudulent metadata",
  5: "Trademark violation",
  6: "Privacy violation",
  7: "Other",
} as const satisfies Record<number, string>;

export const DISPUTE_STATUSES = {
  0: "Pending response",
  1: "Evidence period",
  2: "Arbitration",
  3: "Resolved — challenger won",
  4: "Resolved — owner won",
  5: "Appealed",
  6: "Settled",
} as const satisfies Record<number, string>;

export type Address = `0x${string}`;
export type Bytes32 = `0x${string}`;

export interface TokenMetadata {
  decimals: number;
  symbol: string;
}

export interface ContentMetadata {
  title?: string;
  description?: string;
  fileName?: string;
  image?: string;
  fileUrl?: string;
  fileType?: string;
}

export function deriveRecordId(
  contentHash: `0x${string}`,
  issuer: `0x${string}`,
): `0x${string}` {
  return keccak256(encodePacked(["bytes32", "address"], [contentHash, issuer]));
}

export function contentStatusLabel(status: number): string {
  return (
    CONTENT_STATUSES[status as keyof typeof CONTENT_STATUSES] ??
    `Unknown (${status})`
  );
}

export function licenseTypeLabel(type: number): string {
  return LICENSE_TYPES[type as keyof typeof LICENSE_TYPES] ?? `Unknown (${type})`;
}

export function disputeReasonLabel(reason: number): string {
  return (
    DISPUTE_REASONS[reason as keyof typeof DISPUTE_REASONS] ??
    `Unknown (${reason})`
  );
}

export function disputeStatusLabel(status: number): string {
  return (
    DISPUTE_STATUSES[status as keyof typeof DISPUTE_STATUSES] ??
    `Unknown (${status})`
  );
}

export function isNativeToken(token: string): boolean {
  return isZeroAddress(token);
}

export function isZeroAddress(address: string): boolean {
  return address.toLowerCase() === ZERO_ADDRESS;
}

export function isBytes32(value: string): value is Bytes32 {
  return isHex(value, { strict: true }) && value.length === 66;
}

export function isEthereumAddress(value: string): value is Address {
  return isAddress(value, { strict: false });
}

export function shortAddress(address: string): string {
  if (address.length < 11) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(
  amount: bigint,
  token: TokenMetadata,
  maximumFractionDigits = 6,
): string {
  const raw = formatUnits(amount, token.decimals);
  const [integer, fraction = ""] = raw.split(".");
  const trimmedFraction = fraction.slice(0, maximumFractionDigits).replace(/0+$/, "");
  const value = trimmedFraction ? `${integer}.${trimmedFraction}` : integer;
  return `${value} ${token.symbol}`;
}

export function formatLicensePrice(
  price: bigint,
  paymentToken: string,
  tokenMetadata?: TokenMetadata,
): string {
  if (isNativeToken(paymentToken)) return `${formatEther(price)} ETH`;
  return tokenMetadata
    ? formatTokenAmount(price, tokenMetadata)
    : `${price.toString()} token units`;
}

export function licenseExpiryLabel(validUntil: number): string {
  if (validUntil === 0) return "Perpetual";
  const date = new Date(validUntil * 1000);
  return Number.isNaN(date.getTime()) ? `Unix ${validUntil}` : date.toLocaleDateString();
}

export function isLicenseTemplateAvailable(
  active: boolean,
  exclusive: boolean,
  licensee: string,
  validUntil: number,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  return (
    active &&
    (!exclusive || isZeroAddress(licensee)) &&
    (validUntil === 0 || validUntil > nowSeconds)
  );
}

export function parseContentMetadata(metadataURI: string): ContentMetadata {
  if (!metadataURI) return {};
  try {
    const parsed: unknown = JSON.parse(metadataURI);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { title: metadataURI };
    }
    const value = parsed as Record<string, unknown>;
    const readString = (key: string) =>
      typeof value[key] === "string" ? (value[key] as string) : undefined;
    return {
      title: readString("title"),
      description: readString("description"),
      fileName: readString("fileName"),
      image: readString("image"),
      fileUrl: readString("fileUrl"),
      fileType: readString("fileType"),
    };
  } catch {
    return { title: metadataURI };
  }
}

/** Resolve supported content-addressed URIs and reject unsafe URL schemes. */
export function resolveContentUri(uri: string | undefined): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${uri.slice("ipfs://".length)}`;
  }
  if (uri.startsWith("ar://")) {
    return `https://arweave.net/${uri.slice("ar://".length)}`;
  }
  try {
    const url = new URL(uri);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}
