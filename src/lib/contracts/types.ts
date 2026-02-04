/**
 * Contract Types for Axiom Protocol
 *
 * Strictly typed interfaces based on the AxiomRouter ABI output.
 */

/**
 * Content status enum matching the Solidity contract
 */
export enum ContentStatus {
  Active = 0,
  Revoked = 1,
  Disputed = 2,
}

/**
 * Hash algorithm enum matching the Solidity contract
 */
export enum HashAlgorithm {
  SHA256 = 0,
}

/**
 * Axiom Record structure from the contract
 * Returned by getRecord() and verify()
 */
export interface AxiomRecord {
  /** Address that registered the content */
  issuer: `0x${string}`;
  /** Unix timestamp of registration (uint40) */
  timestamp: bigint;
  /** Current status of the content */
  status: ContentStatus;
  /** Hash algorithm used */
  algorithm: HashAlgorithm;
  /** SHA-256 hash of the content (bytes32) */
  contentHash: `0x${string}`;
  /** URI pointing to content metadata */
  metadataURI: string;
}

/**
 * Identity information structure from the contract
 * Returned by resolveIdentity()
 */
export interface IdentityInfo {
  /** Display name of the identity */
  name: string;
  /** URI pointing to identity proof */
  proofURI: string;
  /** Whether the identity has been verified by operators */
  isVerified: boolean;
  /** Unix timestamp of registration (uint40) */
  registeredAt: bigint;
}

/**
 * Verification result combining validity flag with record data
 */
export interface VerificationResult {
  /** Whether the content is valid (exists and matches claimed issuer) */
  isValid: boolean;
  /** The full record data */
  record: AxiomRecord;
}

/**
 * Parse raw contract tuple into AxiomRecord
 */
export function parseAxiomRecord(
  raw: readonly [
    `0x${string}`, // issuer
    bigint, // timestamp
    number, // status
    number, // algorithm
    `0x${string}`, // contentHash
    string, // metadataURI
  ],
): AxiomRecord {
  return {
    issuer: raw[0],
    timestamp: raw[1],
    status: raw[2] as ContentStatus,
    algorithm: raw[3] as HashAlgorithm,
    contentHash: raw[4],
    metadataURI: raw[5],
  };
}

/**
 * Parse raw contract tuple into IdentityInfo
 */
export function parseIdentityInfo(
  raw: readonly [
    string, // name
    string, // proofURI
    boolean, // isVerified
    bigint, // registeredAt
  ],
): IdentityInfo {
  return {
    name: raw[0],
    proofURI: raw[1],
    isVerified: raw[2],
    registeredAt: raw[3],
  };
}
