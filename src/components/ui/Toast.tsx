import React, { createContext, useContext, useState, useCallback } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  toasts: ToastItem[]
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <Toaster />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export interface UseToastReturn {
  (message: string, type?: ToastType): void
  toast: (message: string, type?: ToastType) => void
}

export function useToast(): UseToastReturn {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const toastFn = context.toast as UseToastReturn
  toastFn.toast = context.toast
  return toastFn
}

export function Toaster(): JSX.Element {
  const context = useContext(ToastContext)
  if (!context) return <></>

  const { toasts, removeToast } = context

  return (
    <>
      {toasts.map((t) => {
        const icon = {
          success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" aria-hidden="true" />,
          error: <AlertCircle className="w-5 h-5 text-danger shrink-0" aria-hidden="true" />,
          info: <Info className="w-5 h-5 text-brand-600 shrink-0" aria-hidden="true" />,
        }[t.type]

        const styleClass = {
          success: 'border-success/30 bg-success-light text-text-primary',
          error: 'border-danger/30 bg-danger-light text-text-primary',
          info: 'border-brand-500/30 bg-brand-50 text-text-primary',
        }[t.type]

        return (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => {
              if (!open) removeToast(t.id)
            }}
            duration={4000}
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border shadow-lg text-sm transition-all',
              'data-[state=open]:animate-slide-down data-[state=closed]:animate-fade-in',
              styleClass
            )}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <ToastPrimitive.Description className="font-medium text-xs sm:text-sm">
                {t.message}
              </ToastPrimitive.Description>
            </div>

            <ToastPrimitive.Close
              aria-label="Close notification"
              className="p-1 rounded text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <X className="w-4 h-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0" />
    </>
  )
}

export default ToastProvider
