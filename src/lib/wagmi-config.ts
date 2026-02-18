import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

/**
 * Axiom Protocol - Wagmi Configuration
 *
 * Primary target: Sepolia Testnet
 * Chain ID: 11155111
 */

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected(), metaMask()],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

// Export chain IDs for easy reference
export const SUPPORTED_CHAIN_IDS = {
  SEPOLIA: 11155111,
  MAINNET: 1,
} as const;

// Target chain for the application
export const TARGET_CHAIN_ID = SUPPORTED_CHAIN_IDS.SEPOLIA;
export const TARGET_CHAIN = sepolia;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
