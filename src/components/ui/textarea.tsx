import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-white/20 bg-black/40 backdrop-blur-md px-3 py-2 text-sm text-white placeholder:text-white/50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axiom-cyan focus-visible:ring-offset-2 focus-visible:border-axiom-cyan disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
