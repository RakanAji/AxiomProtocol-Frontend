"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  FileSignature,
  CheckCircle,
  Fingerprint,
  LayoutDashboard,
  UserCircle,
  Search,
  Activity,
  Trophy,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import { WalletButton, NetworkIndicator } from "@/components/WalletButton";
import { cn } from "@/lib/utils";

// Primary links show label, secondary links are icon-only on medium screens
const primaryLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/register", label: "Register", icon: FileSignature },
  { href: "/verify", label: "Verify", icon: CheckCircle },
];

const secondaryLinks = [
  { href: "/marketplace", label: "Market", icon: ShoppingBag },
  { href: "/identity", label: "Identity", icon: Fingerprint },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/search", label: "Search", icon: Search },
  { href: "/stats", label: "Stats", icon: Activity },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/changelog", label: "Changelog", icon: BookOpen },
];

const allLinks = [...primaryLinks, ...secondaryLinks];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      {/* Main navbar */}
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo - left side */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-axiom-cyan via-axiom-purple to-axiom-pink flex items-center justify-center shadow-lg shadow-axiom-cyan/30 group-hover:shadow-axiom-cyan/50 transition-all">
            <Shield className="w-6 h-6 text-white drop-shadow-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white">
              AXIOM
            </span>
            <span className="text-[10px] text-white/40 tracking-widest uppercase hidden sm:block">
              Protocol
            </span>
          </div>
        </Link>

        {/* Navigation Links - centered */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {/* Primary links - always show label */}
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Secondary links - icon only on md, show label on xl */}
          {secondaryLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <NetworkIndicator />
          <WalletButton />
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-white/10 px-2 py-2 bg-black/80">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {allLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex-shrink-0 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
