import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const cardVariants = cva(
  "rounded-lg border border-border transition-all duration-300 flex flex-col",
  {
    variants: {
      variant: {
        default: "bg-card shadow-card hover:shadow-card-hover hover:border-primary/20",
        interactive: "bg-card shadow-card hover:shadow-card-hover hover:border-primary/40 cursor-pointer hover:scale-[1.01] hover:-translate-y-1",
        elevated: "bg-gradient-executive-card shadow-executive hover:shadow-executive-hover",
        outline: "bg-transparent border-2 border-border/60 hover:border-primary/30",
        ghost: "border-0 shadow-none bg-transparent",
        accent: "bg-card border-accent/20 shadow-card hover:shadow-card-hover hover:border-accent/40",
      },
      size: {
      default: "gap-6 p-6",
      sm: "gap-4 p-4",
      lg: "gap-8 p-8",
      xl: "gap-10 p-10",
        desktop: "gap-8 p-8 xl:gap-12 xl:p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  animated?: boolean
}

function Card({
  className,
  variant,
  size,
  animated,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        cardVariants({ variant, size }),
        animated && "transition-transform duration-200",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 border-b border-border/50 pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-heading text-lg font-bold text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex-1", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-3 border-t border-border/50 pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
