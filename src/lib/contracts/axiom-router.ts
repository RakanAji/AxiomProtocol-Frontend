import { getAddress, isAddress } from "viem";

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
) as `0x${string}`;

export const IS_AXIOM_ROUTER_CONFIGURED = ROUTER_CONFIGURATION_ERROR === null;

// Generated from ../axiomprotocol/src/interfaces/AxiomFacets.sol.
// Run npm run abi:sync after changing the production facet manifest.
export const AXIOM_ROUTER_ABI = [
  {
    "type": "function",
    "name": "addDelegate",
    "inputs": [
      {
        "name": "_delegate",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_delegateType",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_validity",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "appeal",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_reason",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approveZKVerifierForProduction",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "banAddress",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_reason",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "batchRegister",
    "inputs": [
      {
        "name": "_contentHashes",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      },
      {
        "name": "_metadataURIs",
        "type": "string[]",
        "internalType": "string[]"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "changed",
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claimStake",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "configureStakeConfig",
    "inputs": [
      {
        "name": "_config",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.StakeConfig",
        "components": [
          {
            "name": "minStakeAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "minAppealStake",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "stakeToken",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "protocolFeeBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "rewardBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "slashBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "responsePeriod",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "evidencePeriod",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "appealPeriod",
            "type": "uint40",
            "internalType": "uint40"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "confirmErasure",
    "inputs": [
      {
        "name": "_requestId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_proofOfCompliance",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "contentExists",
    "inputs": [
      {
        "name": "_contentHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createLicense",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_licenseType",
        "type": "uint8",
        "internalType": "enum AxiomTypesV2.LicenseType"
      },
      {
        "name": "_price",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_paymentToken",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_royaltyBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "_validUntil",
        "type": "uint40",
        "internalType": "uint40"
      },
      {
        "name": "_exclusive",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "_sublicensable",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "_customTermsURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "deactivateLicense",
    "inputs": [
      {
        "name": "_licenseId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "escalateToArbitration",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_arbitrator",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getActiveDisputes",
    "inputs": [
      {
        "name": "_offset",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_limit",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAppealDeadline",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getApproved",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getApprovedArbitrators",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getArbitratorFee",
    "inputs": [
      {
        "name": "_arbitrator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_reason",
        "type": "uint8",
        "internalType": "enum AxiomTypesV2.DisputeReason"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAttribute",
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_name",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBaseFee",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDIDString",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDelegates",
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct AxiomTypesV2.DIDDelegate[]",
        "components": [
          {
            "name": "delegate",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "delegateType",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "validUntil",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "isActive",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDispute",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.Dispute",
        "components": [
          {
            "name": "disputeId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "recordId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "externalDisputeId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "challenger",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "arbitrator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "reason",
            "type": "uint8",
            "internalType": "enum AxiomTypesV2.DisputeReason"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum AxiomTypesV2.DisputeStatus"
          },
          {
            "name": "stakeAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "stakeToken",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "createdAt",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "deadline",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "resolvedAt",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "evidenceURI",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "responseURI",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDisputesByChallenger",
    "inputs": [
      {
        "name": "_challenger",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDisputesByRecord",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFee",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getGDPRRequest",
    "inputs": [
      {
        "name": "_requestId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.GDPRRequest",
        "components": [
          {
            "name": "recordId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "requestId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "requestType",
            "type": "uint8",
            "internalType": "enum AxiomTypesV2.GDPRRequestType"
          },
          {
            "name": "requestedAt",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "processedAt",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "processed",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "proofOfCompliance",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getIdentity",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.DIDIdentity",
        "components": [
          {
            "name": "level",
            "type": "uint8",
            "internalType": "enum AxiomTypesV2.VerificationLevel"
          },
          {
            "name": "isActive",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "validUntil",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "registeredAt",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "didDocumentHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "did",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "publicKeyJwk",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "serviceEndpoint",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLicense",
    "inputs": [
      {
        "name": "_licenseId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.License",
        "components": [
          {
            "name": "recordId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "licensor",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "licensee",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "paymentToken",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "licenseType",
            "type": "uint8",
            "internalType": "enum AxiomTypesV2.LicenseType"
          },
          {
            "name": "royaltyBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "exclusive",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "sublicensable",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "transferable",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "validFrom",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "validUntil",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "price",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "customTermsURI",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "territoryRestrictions",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLicenseTreasury",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLicensesByOwner",
    "inputs": [
      {
        "name": "_owner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLicensesByRecord",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMaxBatchSize",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMinimumStake",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPrivateRecord",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.PrivateRecord",
        "components": [
          {
            "name": "contentHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "commitment",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "nullifierHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "timestamp",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum AxiomTypesV2.ContentStatus"
          },
          {
            "name": "metadataDeleted",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "metadataURI",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRateLimitSettings",
    "inputs": [],
    "outputs": [
      {
        "name": "window",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maxActions",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRecord",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypes.AxiomRecord",
        "components": [
          {
            "name": "issuer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "timestamp",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum AxiomTypes.ContentStatus"
          },
          {
            "name": "algorithm",
            "type": "uint8",
            "internalType": "enum AxiomTypes.HashAlgorithm"
          },
          {
            "name": "contentHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "metadataURI",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRecordIds",
    "inputs": [
      {
        "name": "_offset",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_limit",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRecordsByCommitment",
    "inputs": [
      {
        "name": "_commitment",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRecordsByIssuer",
    "inputs": [
      {
        "name": "_issuer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRoyaltySplit",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.RoyaltySplit",
        "components": [
          {
            "name": "recipients",
            "type": "address[]",
            "internalType": "address[]"
          },
          {
            "name": "shares",
            "type": "uint16[]",
            "internalType": "uint16[]"
          },
          {
            "name": "autoDistribute",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getStakeConfig",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.StakeConfig",
        "components": [
          {
            "name": "minStakeAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "minAppealStake",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "stakeToken",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "protocolFeeBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "rewardBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "slashBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "responsePeriod",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "evidencePeriod",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "appealPeriod",
            "type": "uint40",
            "internalType": "uint40"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalDIDs",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalFeesCollected",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalRecords",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVerificationLevel",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "enum AxiomTypesV2.VerificationLevel"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getZKVerifier",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "grantEnterpriseStatus",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "hasActiveDispute",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasDID",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasValidLicense",
    "inputs": [
      {
        "name": "_licensee",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "",
        "type": "uint8",
        "internalType": "enum AxiomTypesV2.LicenseType"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "initiateDispute",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_reason",
        "type": "uint8",
        "internalType": "enum AxiomTypesV2.DisputeReason"
      },
      {
        "name": "_evidenceURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "initiateDisputeWithToken",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_reason",
        "type": "uint8",
        "internalType": "enum AxiomTypesV2.DisputeReason"
      },
      {
        "name": "_evidenceURI",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_stakeToken",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_stakeAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isApprovedForAll",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isArbitratorApproved",
    "inputs": [
      {
        "name": "_arbitrator",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isBanned",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isDIDActive",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isEnterpriseUser",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isIdentityVerified",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isLicenseValid",
    "inputs": [
      {
        "name": "_tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isMetadataDeleted",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isPaused",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isZKVerifierProductionApproved",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "meetsVerificationLevel",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_minLevel",
        "type": "uint8",
        "internalType": "enum AxiomTypesV2.VerificationLevel"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "nullifierUsed",
    "inputs": [
      {
        "name": "_nullifierHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "privateRegister",
    "inputs": [
      {
        "name": "_contentHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_commitment",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_nullifierHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_zkProof",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "_metadataURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "purchaseLicense",
    "inputs": [
      {
        "name": "_licenseId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_duration",
        "type": "uint40",
        "internalType": "uint40"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "purchaseLicenseFor",
    "inputs": [
      {
        "name": "_licenseId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_recipient",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_duration",
        "type": "uint40",
        "internalType": "uint40"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "register",
    "inputs": [
      {
        "name": "_contentHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_metadataURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "registerDID",
    "inputs": [
      {
        "name": "_did",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_didDocumentHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_publicKeyJwk",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "registerIdentity",
    "inputs": [
      {
        "name": "_name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_proofURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "requestErasure",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_ownershipProof",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resolveByName",
    "inputs": [
      {
        "name": "_name",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolveByTimeout",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resolveDID",
    "inputs": [
      {
        "name": "_did",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypesV2.DIDIdentity",
        "components": [
          {
            "name": "level",
            "type": "uint8",
            "internalType": "enum AxiomTypesV2.VerificationLevel"
          },
          {
            "name": "isActive",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "validUntil",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "registeredAt",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "didDocumentHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "did",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "publicKeyJwk",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "serviceEndpoint",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolveIdentity",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypes.IdentityInfo",
        "components": [
          {
            "name": "name",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "proofURI",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "isVerified",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "registeredAt",
            "type": "uint40",
            "internalType": "uint40"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "respondToDispute",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_responseURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revoke",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_reason",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeAttribute",
    "inputs": [
      {
        "name": "_name",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_value",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeDID",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeDelegate",
    "inputs": [
      {
        "name": "_delegate",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_delegateType",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeEnterpriseStatus",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeVerification",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "royaltyInfo",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "salePrice",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "rule",
    "inputs": [
      {
        "name": "_externalDisputeId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_ruling",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setApprovalForAll",
    "inputs": [
      {
        "name": "operator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setArbitrator",
    "inputs": [
      {
        "name": "_arbitrator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_approved",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setAttribute",
    "inputs": [
      {
        "name": "_name",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_value",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "_validity",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setBaseFee",
    "inputs": [
      {
        "name": "_fee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setEnterpriseRate",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_rate",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setLicenseTreasury",
    "inputs": [
      {
        "name": "_treasury",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setMaxBatchSize",
    "inputs": [
      {
        "name": "_size",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setRateLimit",
    "inputs": [
      {
        "name": "_window",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_maxActions",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setRoyaltySplit",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_recipients",
        "type": "address[]",
        "internalType": "address[]"
      },
      {
        "name": "_shares",
        "type": "uint16[]",
        "internalType": "uint16[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setServiceEndpoint",
    "inputs": [
      {
        "name": "_serviceEndpoint",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setTerritoryRestrictions",
    "inputs": [
      {
        "name": "_licenseId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_restrictionsURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setTreasuryWallet",
    "inputs": [
      {
        "name": "_wallet",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setVerificationLevel",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_level",
        "type": "uint8",
        "internalType": "enum AxiomTypesV2.VerificationLevel"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setZKVerifier",
    "inputs": [
      {
        "name": "_verifier",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "settleDispute",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_challengerShare",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "_ownerSig",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "_challengerSig",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "settlementDigest",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_challengerShare",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "submitEvidence",
    "inputs": [
      {
        "name": "_disputeId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_evidenceURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unbanAddress",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateDIDDocument",
    "inputs": [
      {
        "name": "_newDocumentHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateIdentity",
    "inputs": [
      {
        "name": "_name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_proofURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateLicense",
    "inputs": [
      {
        "name": "_licenseId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_price",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_validUntil",
        "type": "uint40",
        "internalType": "uint40"
      },
      {
        "name": "_exclusive",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "validDelegate",
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_delegateType",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_delegate",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verify",
    "inputs": [
      {
        "name": "_contentHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_claimedIssuer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AxiomTypes.AxiomRecord",
        "components": [
          {
            "name": "issuer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "timestamp",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum AxiomTypes.ContentStatus"
          },
          {
            "name": "algorithm",
            "type": "uint8",
            "internalType": "enum AxiomTypes.HashAlgorithm"
          },
          {
            "name": "contentHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "metadataURI",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verifyIdentity",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verifyOwnership",
    "inputs": [
      {
        "name": "_recordId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_commitment",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_zkProof",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verifySignature",
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_hash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_signature",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {
        "name": "_to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;

export const AXIOM_ROUTER_CONFIG = {
  address: AXIOM_ROUTER_ADDRESS,
  abi: AXIOM_ROUTER_ABI,
  chainId: TARGET_CHAIN_ID,
} as const;
