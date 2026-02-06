"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import {
  BookOpen,
  Sparkles,
  GitCommit,
  ChevronRight,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import {
  AXIOM_ROUTER_ADDRESS,
  AXIOM_ROUTER_ABI,
} from "@/lib/contracts/axiom-router";
import { cn } from "@/lib/utils";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  type: "major" | "minor" | "patch";
}

const changelog: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-02-06",
    type: "major",
    changes: [
      "Initial release of Axiom Protocol",
      "Content registration with SHA-256 hashing",
      "Identity management system",
      "Dispute resolution mechanism",
      "Real-time activity feed",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-02-01",
    type: "minor",
    changes: [
      "Added leaderboard page",
      "Gas tracker in sidebar",
      "Recent files history",
      "Protocol stats widget",
    ],
  },
  {
    version: "0.8.0",
    date: "2026-01-25",
    type: "minor",
    changes: [
      "Profile page with record history",
      "Search functionality",
      "Identity verification badges",
    ],
  },
];

const tips = [
  {
    icon: "💡",
    title: "Verify Before Sharing",
    description:
      "Always verify your content hash after registration to ensure the record was created correctly.",
  },
  {
    icon: "🔐",
    title: "Protect Your Identity",
    description:
      "Register your identity to build trust and make your content easily attributable to you.",
  },
  {
    icon: "⚡",
    title: "Gas Optimization",
    description:
      "Register content during low gas periods (usually weekends) to save on transaction fees.",
  },
  {
    icon: "📋",
    title: "Batch Registration",
    description:
      "If you have multiple files, consider registering them in batches to save time.",
  },
  {
    icon: "🎯",
    title: "Dispute Carefully",
    description:
      "Only dispute content you have strong evidence against. False disputes may affect your reputation.",
  },
  {
    icon: "🔍",
    title: "Use Search",
    description:
      "Use the search page to quickly find records by content hash or issuer address.",
  },
];

export default function ChangelogPage() {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(
    "1.0.0",
  );
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const { data: version } = useReadContract({
    address: AXIOM_ROUTER_ADDRESS,
    abi: AXIOM_ROUTER_ABI,
    functionName: "VERSION",
  });

  const getVersionColor = (type: ChangelogEntry["type"]) => {
    switch (type) {
      case "major":
        return "bg-axiom-cyan/20 text-axiom-cyan border-axiom-cyan/30";
      case "minor":
        return "bg-axiom-purple/20 text-axiom-purple border-axiom-purple/30";
      case "patch":
        return "bg-axiom-green/20 text-axiom-green border-axiom-green/30";
    }
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-axiom-purple to-axiom-pink flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">
            What&apos;s New
          </h1>
          <p className="text-white/60 max-w-md mx-auto">
            Changelog, tips, and everything you need to know about Axiom
            Protocol
          </p>
          {version && (
            <p className="mt-4 text-sm text-white/40">
              Current contract version:{" "}
              <span className="text-axiom-cyan font-mono">
                {version as string}
              </span>
            </p>
          )}
        </div>

        {/* Tips Carousel */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Pro Tips</h2>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{tips[currentTipIndex].icon}</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tips[currentTipIndex].title}
                </h3>
                <p className="text-white/60">
                  {tips[currentTipIndex].description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <div className="flex gap-1">
                {tips.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTipIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentTipIndex
                        ? "bg-axiom-cyan w-4"
                        : "bg-white/20 hover:bg-white/40",
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevTip}
                  className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={nextTip}
                  className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Changelog */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GitCommit className="w-5 h-5 text-axiom-purple" />
            <h2 className="text-lg font-semibold text-white">Changelog</h2>
          </div>
          <div className="space-y-4">
            {changelog.map((entry) => (
              <div
                key={entry.version}
                className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedVersion(
                      expandedVersion === entry.version ? null : entry.version,
                    )
                  }
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-lg text-sm font-mono border",
                        getVersionColor(entry.type),
                      )}
                    >
                      v{entry.version}
                    </span>
                    <span className="text-white/40 text-sm">{entry.date}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 text-white/40 transition-transform",
                      expandedVersion === entry.version && "rotate-90",
                    )}
                  />
                </button>
                {expandedVersion === entry.version && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5">
                    <ul className="space-y-2">
                      {entry.changes.map((change, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-white/70"
                        >
                          <Sparkles className="w-4 h-4 text-axiom-cyan mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <span className="text-2xl">📚</span>
              <div className="flex-1">
                <p className="text-white font-medium">Documentation</p>
                <p className="text-xs text-white/40">Learn how to use Axiom</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <span className="text-2xl">💬</span>
              <div className="flex-1">
                <p className="text-white font-medium">Discord</p>
                <p className="text-xs text-white/40">Join our community</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <span className="text-2xl">🐦</span>
              <div className="flex-1">
                <p className="text-white font-medium">Twitter</p>
                <p className="text-xs text-white/40">Follow for updates</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <span className="text-2xl">📦</span>
              <div className="flex-1">
                <p className="text-white font-medium">GitHub</p>
                <p className="text-xs text-white/40">View source code</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
