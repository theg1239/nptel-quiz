"use client"

import { useEffect, useState } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/utils"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type ToastActionElement = React.ReactElement

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants> & {
    onOpenChange?: (open: boolean) => void
  }

export function Toast({ className, variant, onOpenChange, ...props }: ToastProps) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (open === false) {
      onOpenChange?.(false)
    }
  }, [open, onOpenChange])

  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      <div className="grid gap-1">
        {props.children}
      </div>
      <button
        onClick={() => setOpen(false)}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <Cross2Icon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function ToastTitle({ className, ...props }: ToastTitleProps) {
  return <div className={cn("text-sm font-semibold", className)} {...props} />
}

interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />
}