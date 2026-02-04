import { http, createConfig } from "wagmi";
import { foundry, mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

/**
 * Axiom Protocol - Wagmi Configuration
 *
 * Primary target: Foundry/Anvil local development
 * Chain ID: 31337
 * RPC: http://127.0.0.1:8545
 */

// Define the foundry chain with custom settings
const localFoundry = {
  ...foundry,
  id: 31337,
  name: "Foundry Local",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
} as const;

export const config = createConfig({
  chains: [localFoundry, sepolia, mainnet],
  connectors: [injected(), metaMask()],
  transports: {
    [localFoundry.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

// Export chain IDs for easy reference
export const SUPPORTED_CHAIN_IDS = {
  FOUNDRY: 31337,
  SEPOLIA: 11155111,
  MAINNET: 1,
} as const;

// Target chain for the application
export const TARGET_CHAIN_ID = SUPPORTED_CHAIN_IDS.FOUNDRY;
export const TARGET_CHAIN = localFoundry;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
