import { cn } from "@/lib/utils";

interface MonoTextProps {
  children: React.ReactNode;
  className?: string;
  truncate?: boolean;
  copyable?: boolean;
}

export function MonoText({
  children,
  className,
  truncate = false,
  copyable = false,
}: MonoTextProps) {
  const handleCopy = () => {
    if (typeof children === "string") {
      navigator.clipboard.writeText(children);
    }
  };

  return (
    <span
      onClick={copyable ? handleCopy : undefined}
      className={cn(
        "font-mono text-axiom-cyan",
        truncate && "truncate block",
        copyable && "cursor-pointer hover:text-axiom-cyan/80 transition-colors",
        className,
      )}
      title={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}
