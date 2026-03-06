import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "neon";
  hoverable?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md backdrop-blur-sm transition-all duration-200",
          {
            "bg-bg-800/20 border border-bg-700/50": variant === "default",
            "bg-bg-800/40 border border-neon-cyan/20": variant === "strong",
            "bg-bg-800/30 border border-neon-cyan shadow-glow-cyan":
              variant === "neon",
          },
          {
            "hover:scale-105 hover:shadow-glow-cyan cursor-pointer": hoverable,
          },
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
