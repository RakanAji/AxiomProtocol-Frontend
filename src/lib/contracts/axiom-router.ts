export const AXIOM_ROUTER_ADDRESS = (process.env
  .NEXT_PUBLIC_AXIOM_ROUTER_ADDRESS ||
  "0x903317a90C3fE3b42692CAF4b695Ff17ACb22cab") as `0x${string}`;

export const AXIOM_ROUTER_ABI = [
  {
    type: "function",
    name: "addDelegate",
    inputs: [
      {
        name: "_delegate",
        type: "address",
        internalType: "address",
      },
      {
        name: "_delegateType",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_validity",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "appeal",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_reason",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "banAddress",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
      {
        name: "_reason",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchRegister",
    inputs: [
      {
        name: "_contentHashes",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "_metadataURIs",
        type: "string[]",
        internalType: "string[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "claimRoyalties",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimRoyaltiesToken",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimStake",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "confirmErasure",
    inputs: [
      {
        name: "_requestId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_proofOfCompliance",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "contentExists",
    inputs: [
      {
        name: "_contentHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createLicense",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_licenseType",
        type: "uint8",
        internalType: "enum AxiomTypesV2.LicenseType",
      },
      {
        name: "_price",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_paymentToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "_royaltyBps",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "_validUntil",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "_exclusive",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "_sublicensable",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "_customTermsURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createSublicense",
    inputs: [
      {
        name: "_tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_price",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_duration",
        type: "uint40",
        internalType: "uint40",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deactivateLicense",
    inputs: [
      {
        name: "_licenseId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "disputeContent",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_reason",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "escalateToArbitration",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_arbitrator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getActiveDisputes",
    inputs: [
      {
        name: "_offset",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_limit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAppealDeadline",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getApproved",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getApprovedArbitrators",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getArbitratorFee",
    inputs: [
      {
        name: "_arbitrator",
        type: "address",
        internalType: "address",
      },
      {
        name: "_reason",
        type: "uint8",
        internalType: "enum AxiomTypesV2.DisputeReason",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBaseFee",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDIDString",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDelegates",
    inputs: [
      {
        name: "_identity",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct AxiomTypesV2.DIDDelegate[]",
        components: [
          {
            name: "delegate",
            type: "address",
            internalType: "address",
          },
          {
            name: "delegateType",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "validUntil",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "isActive",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDispute",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypesV2.Dispute",
        components: [
          {
            name: "disputeId",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "recordId",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "externalDisputeId",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "challenger",
            type: "address",
            internalType: "address",
          },
          {
            name: "arbitrator",
            type: "address",
            internalType: "address",
          },
          {
            name: "reason",
            type: "uint8",
            internalType: "enum AxiomTypesV2.DisputeReason",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum AxiomTypesV2.DisputeStatus",
          },
          {
            name: "stakeAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "stakeToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "createdAt",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "deadline",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "resolvedAt",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "evidenceURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "responseURI",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDisputesByChallenger",
    inputs: [
      {
        name: "_challenger",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDisputesByRecord",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFee",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getGDPRRequest",
    inputs: [
      {
        name: "_requestId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypesV2.GDPRRequest",
        components: [
          {
            name: "recordId",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "requestId",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "requestType",
            type: "uint8",
            internalType: "enum AxiomTypesV2.GDPRRequestType",
          },
          {
            name: "requestedAt",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "processedAt",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "processed",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "proofOfCompliance",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getIdentity",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypesV2.DIDIdentity",
        components: [
          {
            name: "level",
            type: "uint8",
            internalType: "enum AxiomTypesV2.VerificationLevel",
          },
          {
            name: "isActive",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "validUntil",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "registeredAt",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "didDocumentHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "did",
            type: "string",
            internalType: "string",
          },
          {
            name: "publicKeyJwk",
            type: "string",
            internalType: "string",
          },
          {
            name: "serviceEndpoint",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLicense",
    inputs: [
      {
        name: "_licenseId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypesV2.License",
        components: [
          {
            name: "recordId",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "licensor",
            type: "address",
            internalType: "address",
          },
          {
            name: "licensee",
            type: "address",
            internalType: "address",
          },
          {
            name: "paymentToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "licenseType",
            type: "uint8",
            internalType: "enum AxiomTypesV2.LicenseType",
          },
          {
            name: "royaltyBps",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "exclusive",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "sublicensable",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "transferable",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "active",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "validFrom",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "validUntil",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "price",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "customTermsURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "territoryRestrictions",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLicensesByOwner",
    inputs: [
      {
        name: "_owner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLicensesByRecord",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMinimumStake",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPrivateRecord",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypesV2.PrivateRecord",
        components: [
          {
            name: "contentHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "commitment",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "nullifierHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "timestamp",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum AxiomTypesV2.ContentStatus",
          },
          {
            name: "metadataDeleted",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "metadataURI",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRecord",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypes.AxiomRecord",
        components: [
          {
            name: "issuer",
            type: "address",
            internalType: "address",
          },
          {
            name: "timestamp",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum AxiomTypes.ContentStatus",
          },
          {
            name: "algorithm",
            type: "uint8",
            internalType: "enum AxiomTypes.HashAlgorithm",
          },
          {
            name: "contentHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "metadataURI",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRecordsByCommitment",
    inputs: [
      {
        name: "_commitment",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRecordsByIssuer",
    inputs: [
      {
        name: "_issuer",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoyaltySplit",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypesV2.RoyaltySplit",
        components: [
          {
            name: "recipients",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "shares",
            type: "uint16[]",
            internalType: "uint16[]",
          },
          {
            name: "autoDistribute",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStakeConfig",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypesV2.StakeConfig",
        components: [
          {
            name: "minStakeAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "minAppealStake",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "stakeToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "protocolFeeBps",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "rewardBps",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "slashBps",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "responsePeriod",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "evidencePeriod",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "appealPeriod",
            type: "uint40",
            internalType: "uint40",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalFeesCollected",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalRecords",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVerificationLevel",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AxiomTypesV2.VerificationLevel",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getZKVerifier",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "grantEnterpriseStatus",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasActiveDispute",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasDID",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasValidLicense",
    inputs: [
      {
        name: "_licensee",
        type: "address",
        internalType: "address",
      },
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "",
        type: "uint8",
        internalType: "enum AxiomTypesV2.LicenseType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initiateDispute",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_reason",
        type: "uint8",
        internalType: "enum AxiomTypesV2.DisputeReason",
      },
      {
        name: "_evidenceURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "initiateDisputeWithToken",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_reason",
        type: "uint8",
        internalType: "enum AxiomTypesV2.DisputeReason",
      },
      {
        name: "_evidenceURI",
        type: "string",
        internalType: "string",
      },
      {
        name: "_stakeToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "_stakeAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isArbitratorApproved",
    inputs: [
      {
        name: "_arbitrator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isBanned",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDIDActive",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isEnterpriseUser",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isIdentityVerified",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isLicenseValid",
    inputs: [
      {
        name: "_tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isMetadataDeleted",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "meetsVerificationLevel",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
      {
        name: "_minLevel",
        type: "uint8",
        internalType: "enum AxiomTypesV2.VerificationLevel",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "nonce",
    inputs: [
      {
        name: "_identity",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nullifierUsed",
    inputs: [
      {
        name: "_nullifierHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingRoyalties",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "privateRegister",
    inputs: [
      {
        name: "_contentHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_commitment",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_nullifierHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_zkProof",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "_metadataURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "purchaseLicense",
    inputs: [
      {
        name: "_licenseId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_duration",
        type: "uint40",
        internalType: "uint40",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "purchaseLicenseFor",
    inputs: [
      {
        name: "_licenseId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "_duration",
        type: "uint40",
        internalType: "uint40",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "purchaseSublicense",
    inputs: [
      {
        name: "_sublicenseId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "register",
    inputs: [
      {
        name: "_contentHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_metadataURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "registerDID",
    inputs: [
      {
        name: "_did",
        type: "string",
        internalType: "string",
      },
      {
        name: "_didDocumentHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_publicKeyJwk",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerIdentity",
    inputs: [
      {
        name: "_name",
        type: "string",
        internalType: "string",
      },
      {
        name: "_proofURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestErasure",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_ownershipProof",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveByName",
    inputs: [
      {
        name: "_name",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "resolveByTimeout",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveDID",
    inputs: [
      {
        name: "_did",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypesV2.DIDIdentity",
        components: [
          {
            name: "level",
            type: "uint8",
            internalType: "enum AxiomTypesV2.VerificationLevel",
          },
          {
            name: "isActive",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "validUntil",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "registeredAt",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "didDocumentHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "did",
            type: "string",
            internalType: "string",
          },
          {
            name: "publicKeyJwk",
            type: "string",
            internalType: "string",
          },
          {
            name: "serviceEndpoint",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "resolveIdentity",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypes.IdentityInfo",
        components: [
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "proofURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "isVerified",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "registeredAt",
            type: "uint40",
            internalType: "uint40",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "respondToDispute",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_responseURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revoke",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_reason",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeAttribute",
    inputs: [
      {
        name: "_name",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_value",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeDID",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeDelegate",
    inputs: [
      {
        name: "_delegate",
        type: "address",
        internalType: "address",
      },
      {
        name: "_delegateType",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeEnterpriseStatus",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeVerification",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "royaltyInfo",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "salePrice",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rule",
    inputs: [
      {
        name: "_externalDisputeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_ruling",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
      {
        name: "approved",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAttribute",
    inputs: [
      {
        name: "_name",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_value",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "_validity",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBaseFee",
    inputs: [
      {
        name: "_fee",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setEnterpriseRate",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
      {
        name: "_rate",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setMaxBatchSize",
    inputs: [
      {
        name: "_size",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setRateLimit",
    inputs: [
      {
        name: "_window",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_maxActions",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setRoyaltySplit",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_recipients",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "_shares",
        type: "uint16[]",
        internalType: "uint16[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setServiceEndpoint",
    inputs: [
      {
        name: "_serviceEndpoint",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTerritoryRestrictions",
    inputs: [
      {
        name: "_licenseId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_restrictionsURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTreasuryWallet",
    inputs: [
      {
        name: "_wallet",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setVerificationLevel",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
      {
        name: "_level",
        type: "uint8",
        internalType: "enum AxiomTypesV2.VerificationLevel",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setZKVerifier",
    inputs: [
      {
        name: "_verifier",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "settleDispute",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_challengerShare",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "_ownerSig",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "_challengerSig",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitEvidence",
    inputs: [
      {
        name: "_disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_evidenceURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unbanAddress",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateDIDDocument",
    inputs: [
      {
        name: "_newDocumentHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateIdentity",
    inputs: [
      {
        name: "_name",
        type: "string",
        internalType: "string",
      },
      {
        name: "_proofURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateLicense",
    inputs: [
      {
        name: "_licenseId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_price",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_validUntil",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "_exclusive",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "validDelegate",
    inputs: [
      {
        name: "_identity",
        type: "address",
        internalType: "address",
      },
      {
        name: "_delegateType",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_delegate",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "verify",
    inputs: [
      {
        name: "_contentHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_claimedIssuer",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "",
        type: "tuple",
        internalType: "struct AxiomTypes.AxiomRecord",
        components: [
          {
            name: "issuer",
            type: "address",
            internalType: "address",
          },
          {
            name: "timestamp",
            type: "uint40",
            internalType: "uint40",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum AxiomTypes.ContentStatus",
          },
          {
            name: "algorithm",
            type: "uint8",
            internalType: "enum AxiomTypes.HashAlgorithm",
          },
          {
            name: "contentHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "metadataURI",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "verifyIdentity",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyOwnership",
    inputs: [
      {
        name: "_recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_commitment",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_zkProof",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "verifySignature",
    inputs: [
      {
        name: "_identity",
        type: "address",
        internalType: "address",
      },
      {
        name: "_hash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      {
        name: "_to",
        type: "address",
        internalType: "address",
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "FacetAdded",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        indexed: true,
        internalType: "bytes4",
      },
      {
        name: "facetAddress",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FacetRemoved",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        indexed: true,
        internalType: "bytes4",
      },
      {
        name: "facetAddress",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FacetReplaced",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        indexed: true,
        internalType: "bytes4",
      },
      {
        name: "oldFacet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newFacet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Paused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "previousAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "newAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Unpaused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ContentRegistered",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "issuer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "contentHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "timestamp",
        type: "uint40",
        indexed: false,
        internalType: "uint40",
      },
      {
        name: "metadataURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ContentRevoked",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "issuer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "reason",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeeCollected",
    inputs: [
      {
        name: "payer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "IdentityRegistered",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "name",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "proofURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "IdentityVerified",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "verifier",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AddressBanned",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "reason",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AddressUnbanned",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ContentDisputed",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "reason",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProtocolPaused",
    inputs: [
      {
        name: "by",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProtocolUnpaused",
    inputs: [
      {
        name: "by",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RateLimitUpdated",
    inputs: [
      {
        name: "window",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "maxActions",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DIDAttributeChanged",
    inputs: [
      {
        name: "identity",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "name",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "value",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "validTo",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "previousChange",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DIDDelegateChanged",
    inputs: [
      {
        name: "identity",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "delegateType",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "delegate",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "validTo",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "previousChange",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DIDRegistered",
    inputs: [
      {
        name: "identity",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "did",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "didDocumentHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VerificationLevelChanged",
    inputs: [
      {
        name: "identity",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "oldLevel",
        type: "uint8",
        indexed: false,
        internalType: "enum AxiomTypesV2.VerificationLevel",
      },
      {
        name: "newLevel",
        type: "uint8",
        indexed: false,
        internalType: "enum AxiomTypesV2.VerificationLevel",
      },
      {
        name: "verifier",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeAppealed",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "appealId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "appellant",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "additionalStake",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeEscalated",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "arbitrator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "externalDisputeId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeInitiated",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "challenger",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "reason",
        type: "uint8",
        indexed: false,
        internalType: "enum AxiomTypesV2.DisputeReason",
      },
      {
        name: "stakeAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeResolved",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "outcome",
        type: "uint8",
        indexed: false,
        internalType: "enum AxiomTypesV2.DisputeStatus",
      },
      {
        name: "winner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeResponseSubmitted",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "responseURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeSettled",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "challengerShare",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "ownerShare",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EvidenceSubmitted",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "submitter",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "evidenceURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StakeClaimed",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "claimant",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LicenseCreated",
    inputs: [
      {
        name: "licenseId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "licensor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "licenseType",
        type: "uint8",
        indexed: false,
        internalType: "enum AxiomTypesV2.LicenseType",
      },
      {
        name: "price",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LicenseDeactivated",
    inputs: [
      {
        name: "licenseId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "licensor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LicensePurchased",
    inputs: [
      {
        name: "licenseId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "licensee",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "pricePaid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoyaltyDistributed",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoyaltySplitUpdated",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "recipients",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "shares",
        type: "uint16[]",
        indexed: false,
        internalType: "uint16[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SublicenseCreated",
    inputs: [
      {
        name: "sublicenseId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "parentTokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "sublicensor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GDPRErasureProcessed",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "requestId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "processedAt",
        type: "uint40",
        indexed: false,
        internalType: "uint40",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GDPRErasureRequested",
    inputs: [
      {
        name: "requestId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "requestedAt",
        type: "uint40",
        indexed: false,
        internalType: "uint40",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PrivateContentRegistered",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "commitment",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "nullifierHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "timestamp",
        type: "uint40",
        indexed: false,
        internalType: "uint40",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ZKVerifierUpdated",
    inputs: [
      {
        name: "oldVerifier",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newVerifier",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AccessControlBadConfirmation",
    inputs: [],
  },
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "neededRole",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        name: "implementation",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: [],
  },
  {
    type: "error",
    name: "EnforcedPause",
    inputs: [],
  },
  {
    type: "error",
    name: "ExpectedPause",
    inputs: [],
  },
  {
    type: "error",
    name: "FacetAlreadyExists",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "FacetNotFound",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidFacetAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: [],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: [],
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        name: "slot",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "AddressBanned",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ArrayLengthMismatch",
    inputs: [],
  },
  {
    type: "error",
    name: "BatchSizeExceeded",
    inputs: [
      {
        name: "size",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxSize",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ContentAlreadyExists",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "ContentAlreadyRevoked",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "ContentNotFound",
    inputs: [
      {
        name: "recordId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "InsufficientFee",
    inputs: [
      {
        name: "sent",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "required",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "NotIssuer",
    inputs: [
      {
        name: "caller",
        type: "address",
        internalType: "address",
      },
      {
        name: "issuer",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "RateLimitExceeded",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "IdentityAlreadyExists",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "IdentityNotFound",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "DIDAlreadyExists",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "DIDExpired",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
      {
        name: "expiredAt",
        type: "uint40",
        internalType: "uint40",
      },
    ],
  },
  {
    type: "error",
    name: "DIDNotFound",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "DIDRevoked",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignature",
    inputs: [],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "OperationNotPermitted",
    inputs: [],
  },
  {
    type: "error",
    name: "UnauthorizedDelegate",
    inputs: [
      {
        name: "identity",
        type: "address",
        internalType: "address",
      },
      {
        name: "delegate",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "DisputeDeadlinePassed",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "deadline",
        type: "uint40",
        internalType: "uint40",
      },
    ],
  },
  {
    type: "error",
    name: "DisputeNotFound",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "InsufficientStake",
    inputs: [
      {
        name: "provided",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "required",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidDisputeStatus",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "expected",
        type: "uint8",
        internalType: "enum AxiomTypesV2.DisputeStatus",
      },
      {
        name: "actual",
        type: "uint8",
        internalType: "enum AxiomTypesV2.DisputeStatus",
      },
    ],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "UnauthorizedDisputeAction",
    inputs: [
      {
        name: "disputeId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "caller",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidRoyaltySplit",
    inputs: [
      {
        name: "totalShares",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "LicenseAlreadyPurchased",
    inputs: [
      {
        name: "licenseId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "LicenseExpired",
    inputs: [
      {
        name: "licenseId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "expiredAt",
        type: "uint40",
        internalType: "uint40",
      },
    ],
  },
  {
    type: "error",
    name: "LicenseNotFound",
    inputs: [
      {
        name: "licenseId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "NotLicensor",
    inputs: [
      {
        name: "caller",
        type: "address",
        internalType: "address",
      },
      {
        name: "licensor",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidGDPRRequest",
    inputs: [
      {
        name: "requestId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidZKProof",
    inputs: [],
  },
  {
    type: "error",
    name: "NullifierAlreadyUsed",
    inputs: [
      {
        name: "nullifierHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
] as const;
