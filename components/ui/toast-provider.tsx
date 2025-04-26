"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const ToastContext = createContext<{
  toasts: ToasterToast[]
  addToast: (toast: ToasterToast) => void
  removeToast: (toastId: string) => void
  updateToast: (toast: ToasterToast) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  updateToast: () => {},
})

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const addToast = (toast: ToasterToast) => {
    setToasts((prevToasts) => {
      const existingToast = prevToasts.find((t) => t.id === toast.id)

      // If toast with the same id exists, update it
      if (existingToast) {
        return prevToasts.map((t) =>
          t.id === toast.id ? { ...t, ...toast } : t
        )
      }

      // Otherwise, add the new toast, making sure we don't exceed the limit
      return [toast, ...prevToasts].slice(0, TOAST_LIMIT)
    })
  }

  const removeToast = (toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
  }

  const updateToast = (toast: ToasterToast) => {
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t))
    )
  }

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        updateToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}