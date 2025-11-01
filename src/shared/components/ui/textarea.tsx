import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const textareaVariants = cva(
  "flex w-full rounded-lg border border-border bg-card text-sm transition-[color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:-translate-y-0.5 focus-visible:shadow-md dark:focus-visible:ring-offset-slate-950 px-4 py-2.5 min-h-[100px] resize-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
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

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    const effectiveVariant = variant || (props["aria-invalid"] ? "error" : "default")

    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        data-state={effectiveVariant !== "default" ? effectiveVariant : undefined}
        className={cn(
          textareaVariants({ variant: effectiveVariant }),
          !variant && "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
