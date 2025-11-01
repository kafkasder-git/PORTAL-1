import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border border-border bg-card text-sm transition-[color,border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:-translate-y-0.5 focus-visible:shadow-md dark:focus-visible:ring-offset-slate-950 px-4 py-2.5 h-10",
  {
    variants: {
      variant: {
        default: "border-border hover:border-primary/30 focus-visible:border-primary",
        error: "border-error/50 focus-visible:border-error focus-visible:ring-error/20",
        success: "border-success/50 focus-visible:border-success focus-visible:ring-success/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    const effectiveVariant = variant || (props["aria-invalid"] ? "error" : "default")

    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        data-state={effectiveVariant !== "default" ? effectiveVariant : undefined}
        className={cn(
          inputVariants({ variant: effectiveVariant }),
          !variant && "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
