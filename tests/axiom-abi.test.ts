import { describe, expect, it } from "vitest";

import { AXIOM_ROUTER_ABI } from "../src/lib/contracts/axiom-router";

const functions = AXIOM_ROUTER_ABI.filter(
  (entry) => entry.type === "function",
);
const functionNames = functions.map((entry) => entry.name);

describe("production router ABI", () => {
  it("matches the canonical 121-function facet manifest", () => {
    expect(functions).toHaveLength(121);
  });

  it.each([
    "appeal",
    "getActiveDisputes",
    "getAppealDeadline",
    "getFee",
    "getRecordIds",
    "getStakeConfig",
    "initiateDispute",
    "initiateDisputeWithToken",
    "isZKVerifierProductionApproved",
    "setLicenseTreasury",
  ])("contains required function %s", (name) => {
    expect(functionNames).toContain(name);
  });

  it.each([
    "claimRoyalties",
    "claimRoyaltiesToken",
    "createSublicense",
    "disputeContent",
    "nonce",
    "pendingRoyalties",
    "purchaseSublicense",
  ])("does not expose excluded function %s", (name) => {
    expect(functionNames).not.toContain(name);
  });
});
