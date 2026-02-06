"use client";

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Left side orbs */}
      <div
        className="absolute -left-32 top-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-axiom-cyan/20 to-transparent blur-3xl animate-float-slow"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute -left-20 top-2/3 w-48 h-48 rounded-full bg-gradient-to-br from-axiom-purple/15 to-transparent blur-3xl animate-float-medium"
        style={{ animationDelay: "3s" }}
      />

      {/* Right side orbs */}
      <div
        className="absolute -right-32 top-1/3 w-72 h-72 rounded-full bg-gradient-to-bl from-axiom-pink/15 to-transparent blur-3xl animate-float-medium"
        style={{ animationDelay: "5s" }}
      />
      <div
        className="absolute -right-24 top-3/4 w-56 h-56 rounded-full bg-gradient-to-bl from-axiom-green/20 to-transparent blur-3xl animate-float-slow"
        style={{ animationDelay: "8s" }}
      />

      {/* Subtle center orbs */}
      <div
        className="absolute left-1/4 top-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-axiom-cyan/5 via-axiom-purple/5 to-transparent blur-3xl animate-float-slow"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute right-1/4 bottom-1/4 w-80 h-80 rounded-full bg-gradient-to-l from-axiom-pink/5 via-axiom-green/5 to-transparent blur-3xl animate-float-medium"
        style={{ animationDelay: "6s" }}
      />
    </div>
  );
}
