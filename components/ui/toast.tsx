"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, X } from "lucide-react"

import { cn } from "@/lib/utils"

const DISMISS_AFTER_MS = 3500
const EXIT_MS = 200
const MAX_VISIBLE = 3

type ToastTone = "success" | "error"

type ToastItem = {
  id: number
  message: string
  tone: ToastTone
  leaving: boolean
}

type ToastApi = {
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = React.createContext<ToastApi | null>(null)

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const nextId = React.useRef(0)

  // The row is flagged first and dropped after the exit animation, otherwise it would vanish mid-slide.
  const dismiss = React.useCallback((id: number) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
    )
    setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      EXIT_MS,
    )
  }, [])

  const push = React.useCallback(
    (message: string, tone: ToastTone) => {
      const id = nextId.current++
      setToasts((current) =>
        [...current, { id, message, tone, leaving: false }].slice(-MAX_VISIBLE),
      )
      setTimeout(() => dismiss(id), DISMISS_AFTER_MS)
    },
    [dismiss],
  )

  // The API object is memoised so a consumer re-rendering does not re-fire its own effects.
  const api = React.useMemo<ToastApi>(
    () => ({
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-60 flex flex-col items-center gap-2 px-[26px]"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            data-state={toast.leaving ? "closed" : "open"}
            className="bg-surface border-divider data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4 pointer-events-auto flex w-full max-w-[400px] items-center gap-3 rounded-xl border px-4 py-3 shadow-lg duration-200 fill-mode-both"
          >
            {toast.tone === "success" ? (
              <CircleCheck aria-hidden className="text-success size-5 shrink-0" />
            ) : (
              <CircleAlert
                aria-hidden
                className="text-button-primary size-5 shrink-0"
              />
            )}
            <span
              className={cn(
                "min-w-0 flex-1 text-sm font-semibold",
                toast.tone === "success" ? "text-text-primary" : "text-button-primary",
              )}
            >
              {toast.message}
            </span>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => dismiss(toast.id)}
              className="text-text-secondary shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function useToast(): ToastApi {
  const api = React.useContext(ToastContext)
  if (!api) throw new Error("useToast must be used inside ToastProvider")
  return api
}

export { ToastProvider, useToast }
