import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Fingerprint,
  Gavel,
  ScrollText,
  ShoppingBag,
} from "lucide-react";

const capabilities = [
  {
    icon: Fingerprint,
    title: "Register a fingerprint",
    description:
      "Hash a file locally, then anchor its SHA-256 fingerprint, metadata, wallet, and timestamp through the configured router.",
  },
  {
    icon: CheckCircle2,
    title: "Inspect current records",
    description:
      "Look up a canonical record by content hash and issuer, including its current Active, Revoked, or Disputed status.",
  },
  {
    icon: ShoppingBag,
    title: "Create and purchase licenses",
    description:
      "Use native ETH or the ERC-20 selected by a license, with token-aware amounts, expiry, availability, and allowance checks.",
  },
  {
    icon: Gavel,
    title: "Open stake-backed disputes",
    description:
      "Submit an evidence URI and the configured ETH or ERC-20 stake. The protocol lifecycle, not this interface, decides outcomes.",
  },
];

const limitations = [
  "A matching registration proves that a wallet anchored a fingerprint at a time. It does not independently prove authorship, legality, or factual truth.",
  "Private registration stays disabled until a production-approved verifier and a real proof-generation flow are configured.",
  "Reads and transactions fail closed when the router address or target chain is missing or unsupported.",
  "Marketplace and leaderboard results are bounded snapshots of records enumerated by the current deployment, not an off-chain global index.",
];

export default function GuidePage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-axiom-purple to-axiom-pink">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Protocol Usage Guide
          </h1>
          <p className="mx-auto max-w-2xl text-white/60">
            What this interface does today, and the boundaries you should know
            before signing a transaction.
          </p>
        </div>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-axiom-cyan" />
            <h2 className="text-lg font-semibold text-white">
              Available flows
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl"
              >
                <Icon className="mb-3 h-5 w-5 text-axiom-cyan" />
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/55">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <h2 className="text-lg font-semibold text-white">
              Important limitations
            </h2>
          </div>
          <ul className="space-y-3">
            {limitations.map((limitation) => (
              <li
                key={limitation}
                className="flex items-start gap-3 text-sm leading-relaxed text-white/60"
              >
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-amber-300" />
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
