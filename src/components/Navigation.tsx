"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  FileSignature,
  CheckCircle,
  Fingerprint,
  LayoutDashboard,
} from "lucide-react";
import { WalletButton, NetworkIndicator } from "@/components/WalletButton";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/register", label: "Register", icon: FileSignature },
  { href: "/verify", label: "Verify", icon: CheckCircle },
  { href: "/identity", label: "Identity", icon: Fingerprint },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-axiom-cyan to-axiom-purple flex items-center justify-center group-hover:shadow-glow-cyan transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">AXIOM</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NetworkIndicator />
            <WalletButton />
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-white/10 px-4 py-2 bg-black/80">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white",
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
