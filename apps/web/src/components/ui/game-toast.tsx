/**
 * Game-style Toast Notification System
 * Futuristic notifications with animations
 */

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X, Zap, Sparkles, Shield, Rocket } from 'lucide-react'
import { cn } from '@/lib/styles'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'agent'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  agent?: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  agent: (title: string, message?: string, agentName?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const TOAST_ICONS: Record<ToastType, any> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  agent: Sparkles,
}

const AGENT_ICONS: Record<string, any> = {
  Sirius: Zap,
  Andromeda: Sparkles,
  Vega: Shield,
  Rigel: Info,
  Cassiopeia: Info,
  Betelgeuse: Rocket,
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string; glow: string }> = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  agent: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }, [addToast])

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }, [addToast])

  const agent = useCallback((title: string, message?: string, agentName?: string) => {
    addToast({ type: 'agent', title, message, agent: agentName })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info, agent }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const style = TOAST_STYLES[toast.type]
  const Icon = toast.agent && AGENT_ICONS[toast.agent] ? AGENT_ICONS[toast.agent] : TOAST_ICONS[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'pointer-events-auto min-w-[320px] max-w-md rounded-xl border backdrop-blur-xl',
        'shadow-lg',
        style.bg,
        style.border,
        style.glow
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('p-2 rounded-lg', style.bg)}>
            <Icon className={cn('w-5 h-5', style.icon)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
              {toast.agent && (
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                  {toast.agent}
                </span>
              )}
            </div>
            {toast.message && (
              <p className="text-sm text-slate-400 mt-1">{toast.message}</p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <motion.div
          className={cn('h-0.5 mt-3 rounded-full', style.icon.replace('text-', 'bg-'))}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}

// Standalone toast component for server components
export function StaticToast({ type, title, message }: { type: ToastType; title: string; message?: string }) {
  const style = TOAST_STYLES[type]
  const Icon = TOAST_ICONS[type]

  return (
    <div
      className={cn(
        'min-w-[320px] max-w-md rounded-xl border backdrop-blur-xl',
        'shadow-lg',
        style.bg,
        style.border
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', style.bg)}>
            <Icon className={cn('w-5 h-5', style.icon)} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            {message && <p className="text-sm text-slate-400 mt-1">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
