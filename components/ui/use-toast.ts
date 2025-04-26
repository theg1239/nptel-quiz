"use client"

import { ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"
import { useToast as useToastContext } from "@/components/ui/toast-provider"

const TOAST_REMOVE_DELAY = 5000

type ToastOptions = Omit<ToastProps, "id"> & {
  id?: string
  title?: ReactNode
  description?: ReactNode
  action?: ToastActionElement
  duration?: number
}

export function useToast() {
  const { toasts, addToast, removeToast, updateToast } = useToastContext()

  function toast(opts: ToastOptions) {
    const id = opts.id || uuidv4()
    const duration = opts.duration || TOAST_REMOVE_DELAY

    const newToast = {
      id,
      ...opts,
      onOpenChange: (open: boolean) => {
        if (!open) {
          removeToast(id)
        }
      },
    }

    addToast(newToast)

    if (duration && duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return {
      id,
      dismiss: () => removeToast(id),
      update: (props: ToastOptions) => 
        updateToast({ ...newToast, ...props }),
    }
  }

  function dismiss(toastId?: string) {
    if (toastId) {
      removeToast(toastId)
    } else {
      for (const toast of toasts) {
        removeToast(toast.id)
      }
    }
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}