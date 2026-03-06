import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neonButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wider",
  {
    variants: {
      variant: {
        hero: "bg-transparent border border-neon-cyan text-neon-cyan hover:shadow-glow-cyan hover:text-white hover:bg-neon-cyan/5 font-orbitron",
        neon: "bg-transparent border border-neon-cyan text-neon-cyan shadow-glow-cyan bg-neon-cyan/5 hover:shadow-glow-cyan hover:text-white",
        violet:
          "bg-transparent border border-neon-violet text-neon-violet hover:shadow-glow-violet hover:text-white hover:bg-neon-violet/5",
        gold: "bg-transparent border border-neon-gold text-neon-gold hover:shadow-glow-gold hover:text-white hover:bg-neon-gold/5",
        red: "bg-transparent border border-neon-red text-neon-red hover:shadow-glow-red hover:text-white hover:bg-neon-red/5",
        outline:
          "bg-transparent border border-neon-cyan/50 text-text-secondary hover:border-neon-cyan hover:text-neon-cyan hover:shadow-glow-cyan",
        ghost:
          "bg-transparent border-transparent text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/5",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        default: "h-10 px-4 py-2 rounded-md",
        lg: "h-12 rounded-md px-6 text-base",
        xl: "h-14 rounded-md px-8 text-lg font-semibold",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  asChild?: boolean;
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(neonButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NeonButton.displayName = "NeonButton";

export { NeonButton, neonButtonVariants };
