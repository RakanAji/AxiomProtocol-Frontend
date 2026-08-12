import { describe, expect, it } from "vitest";
import { encodePacked, keccak256, parseUnits } from "viem";

import {
  DISPUTE_REASONS,
  LICENSE_TYPES,
  ZERO_ADDRESS,
  contentStatusLabel,
  deriveRecordId,
  disputeReasonLabel,
  formatLicensePrice,
  isBytes32,
  isLicenseTemplateAvailable,
  licenseExpiryLabel,
  licenseTypeLabel,
  parseContentMetadata,
  resolveContentUri,
} from "../src/lib/axiom-domain";

const contentHash =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
const issuer = "0x1111111111111111111111111111111111111111" as const;
const token = "0x2222222222222222222222222222222222222222" as const;

describe("canonical record identifiers", () => {
  it("matches Solidity keccak256(abi.encodePacked(hash, issuer))", () => {
    expect(deriveRecordId(contentHash, issuer)).toBe(
      keccak256(encodePacked(["bytes32", "address"], [contentHash, issuer])),
    );
  });

  it("accepts only exact bytes32 hex values", () => {
    expect(isBytes32(contentHash)).toBe(true);
    expect(isBytes32("0x1234")).toBe(false);
    expect(isBytes32(`0x${"z".repeat(64)}`)).toBe(false);
  });
});

describe("contract enum labels", () => {
  it("covers every Solidity V2 license and dispute reason", () => {
    expect(Object.keys(LICENSE_TYPES)).toHaveLength(12);
    expect(Object.keys(DISPUTE_REASONS)).toHaveLength(8);
    expect(licenseTypeLabel(10)).toBe("Exclusive");
    expect(disputeReasonLabel(0)).toBe("Copyright infringement");
  });

  it("does not silently mislabel unknown enum values", () => {
    expect(contentStatusLabel(99)).toBe("Unknown (99)");
    expect(licenseTypeLabel(99)).toBe("Unknown (99)");
  });
});

describe("license presentation and availability", () => {
  it("formats native and ERC-20 prices with their own decimals", () => {
    expect(formatLicensePrice(parseUnits("1.25", 18), ZERO_ADDRESS)).toBe(
      "1.25 ETH",
    );
    expect(
      formatLicensePrice(parseUnits("12.5", 6), token, {
        decimals: 6,
        symbol: "USDC",
      }),
    ).toBe("12.5 USDC");
  });

  it("rejects inactive, expired, and sold exclusive templates", () => {
    expect(isLicenseTemplateAvailable(true, false, ZERO_ADDRESS, 0, 100)).toBe(
      true,
    );
    expect(isLicenseTemplateAvailable(false, false, ZERO_ADDRESS, 0, 100)).toBe(
      false,
    );
    expect(isLicenseTemplateAvailable(true, false, ZERO_ADDRESS, 99, 100)).toBe(
      false,
    );
    expect(isLicenseTemplateAvailable(true, true, issuer, 0, 100)).toBe(false);
  });

  it("distinguishes perpetual licenses from dated expiry", () => {
    expect(licenseExpiryLabel(0)).toBe("Perpetual");
    expect(licenseExpiryLabel(1)).not.toBe("Perpetual");
  });
});

describe("metadata and external URI safety", () => {
  it("parses JSON metadata and degrades raw strings to a title", () => {
    expect(
      parseContentMetadata('{"title":"Work","fileType":"image/png"}'),
    ).toEqual({ title: "Work", fileType: "image/png" });
    expect(parseContentMetadata("ipfs://metadata")).toEqual({
      title: "ipfs://metadata",
    });
  });

  it("resolves supported schemes and rejects executable schemes", () => {
    expect(resolveContentUri("ipfs://bafy/test")).toBe(
      "https://gateway.pinata.cloud/ipfs/bafy/test",
    );
    expect(resolveContentUri("ar://transaction")).toBe(
      "https://arweave.net/transaction",
    );
    expect(resolveContentUri("javascript:alert(1)")).toBeUndefined();
  });
});
