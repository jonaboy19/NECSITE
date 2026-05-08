'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/40 bg-red-500/10 text-red-400',
  warning: 'border-brand-gold/40 bg-brand-gold/10 text-brand-gold',
  info: 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type, duration }])
    setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast])
  const error = useCallback((msg: string) => toast(msg, 'error'), [toast])
  const warning = useCallback((msg: string) => toast(msg, 'warning'), [toast])
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl pointer-events-auto animate-fade-in ${styles[t.type]} bg-kaf-card`}
            >
              <Icon size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-white flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
