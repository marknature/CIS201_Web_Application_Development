import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_18px_36px_-24px_rgba(204,0,0,0.9)] hover:bg-[#b80000] hover:shadow-[0_22px_40px_-24px_rgba(204,0,0,0.85)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_18px_36px_-24px_rgba(204,0,0,0.9)] hover:bg-[#b80000]",
        danger:
          "bg-destructive text-destructive-foreground shadow-[0_18px_36px_-24px_rgba(204,0,0,0.9)] hover:bg-[#b80000]",
        outline:
          "border border-[#d8dde6] bg-white text-foreground shadow-[0_16px_30px_-28px_rgba(26,26,26,0.4)] hover:bg-[#f8f9fb] hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_16px_30px_-28px_rgba(26,26,26,0.65)] hover:bg-[#2a2a2a]",
        success:
          "bg-emerald-600 text-white shadow-[0_18px_36px_-24px_rgba(5,150,105,0.6)] hover:bg-emerald-700",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
