#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const frontendRoot = resolve(import.meta.dirname, "..");
const contractRoot = resolve(
  frontendRoot,
  process.env.AXIOM_CONTRACT_DIR || "../axiomprotocol",
);
const outputPath = resolve(
  frontendRoot,
  "src/lib/contracts/axiom-router.ts",
);

const expectedFunctionCount = 121;
const requiredFunctions = [
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
];
const excludedFunctions = [
  "claimRoyalties",
  "claimRoyaltiesToken",
  "createSublicense",
  "disputeContent",
  "nonce",
  "pendingRoyalties",
  "purchaseSublicense",
];

if (!existsSync(resolve(contractRoot, "foundry.toml"))) {
  throw new Error(
    `Contract repository not found at ${contractRoot}. Set AXIOM_CONTRACT_DIR to its path.`,
  );
}

const rawAbi = execFileSync(
  "forge",
  ["inspect", "AxiomFacets", "abi", "--json"],
  {
    cwd: contractRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  },
);
const abi = JSON.parse(rawAbi);
const functions = abi.filter((entry) => entry.type === "function");
const functionNames = new Set(functions.map((entry) => entry.name));

if (functions.length !== expectedFunctionCount) {
  throw new Error(
    `Refusing to write ABI: expected ${expectedFunctionCount} functions, received ${functions.length}.`,
  );
}

for (const name of requiredFunctions) {
  if (!functionNames.has(name)) {
    throw new Error(`Refusing to write ABI: required function ${name} is missing.`);
  }
}

for (const name of excludedFunctions) {
  if (functionNames.has(name)) {
    throw new Error(`Refusing to write ABI: excluded function ${name} is present.`);
  }
}

const source = `import { getAddress, isAddress } from "viem";

import { ZERO_ADDRESS } from "@/lib/axiom-domain";
import {
  CHAIN_CONFIGURATION_ERROR,
  TARGET_CHAIN_ID,
} from "@/lib/wagmi-config";

const configuredRouterAddress =
  process.env.NEXT_PUBLIC_AXIOM_ROUTER_ADDRESS || ZERO_ADDRESS;

export const ROUTER_CONFIGURATION_ERROR = CHAIN_CONFIGURATION_ERROR
  ? CHAIN_CONFIGURATION_ERROR
  : !isAddress(configuredRouterAddress)
    ? "NEXT_PUBLIC_AXIOM_ROUTER_ADDRESS is not a valid address."
    : configuredRouterAddress.toLowerCase() === ZERO_ADDRESS
      ? "Axiom Router is not configured for this deployment."
      : null;

export const AXIOM_ROUTER_ADDRESS = (
  isAddress(configuredRouterAddress)
    ? getAddress(configuredRouterAddress)
    : ZERO_ADDRESS
) as \`0x\${string}\`;

export const IS_AXIOM_ROUTER_CONFIGURED = ROUTER_CONFIGURATION_ERROR === null;

// Generated from ../axiomprotocol/src/interfaces/AxiomFacets.sol.
// Run npm run abi:sync after changing the production facet manifest.
export const AXIOM_ROUTER_ABI = ${JSON.stringify(abi, null, 2)} as const;

export const AXIOM_ROUTER_CONFIG = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;
`;

writeFileSync(outputPath, source);
console.log(`Wrote ${functions.length} canonical functions to ${outputPath}`);
