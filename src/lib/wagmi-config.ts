import { http, createConfig, injected } from "wagmi";
import { sepolia } from "wagmi/chains";

/**
 * Axiom Protocol - Wagmi Configuration
 *
 * Primary target: Sepolia Testnet
 * Chain ID: 11155111
 */

const requestedChainId = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID || sepolia.id,
);

export const SUPPORTED_CHAIN_IDS = {
  SEPOLIA: sepolia.id,
} as const;

export const TARGET_CHAIN_ID = SUPPORTED_CHAIN_IDS.SEPOLIA;
export const TARGET_CHAIN = sepolia;
export const PRIVACY_FEATURE_ENABLED =
  process.env.NEXT_PUBLIC_PRIVACY_ENABLED === "true";

export const CHAIN_CONFIGURATION_ERROR =
  requestedChainId === TARGET_CHAIN_ID
    ? null
    : `Unsupported NEXT_PUBLIC_CHAIN_ID ${requestedChainId}. This build supports Sepolia (${TARGET_CHAIN_ID}) only.`;

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
  },
  ssr: true,
});

export function isSupportedChain(chainId: number | undefined): boolean {
  return chainId === TARGET_CHAIN_ID;
}

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
