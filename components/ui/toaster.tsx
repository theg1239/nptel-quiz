"use client"

import { useEffect, useState } from "react"

import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

interface ToastProperties {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  [key: string]: any
}

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    >
      {toasts.map(({ id, title, description, action, ...props }: ToastProperties) => (
        <Toast 
          key={id} 
          {...props} 
          className="border border-gray-700 bg-gray-900 text-gray-100 shadow-lg"
          onOpenChange={(open) => {
            if (!open) dismiss(id)
          }}
        >
          {title && <ToastTitle className="text-gray-200">{title}</ToastTitle>}
          {description && <ToastDescription className="text-gray-300">{description}</ToastDescription>}
          {action}
        </Toast>
      ))}
    </div>
  )
}