import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return <div className="page-state" role="status"><LoaderCircle className="spin text-emerald-700" size={27} /><span>{label}</span></div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-panel state-error" role="alert">
      <span className="state-icon"><AlertCircle size={20} /></span>
      <div className="min-w-0"><h2>Un problème est survenu</h2><p>{message}</p></div>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Réessayer</Button>}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Inbox size={23} strokeWidth={1.7} /></span>
      <h2>{title}</h2><p>{description}</p>{action}
    </div>
  )
}

export function InlineAlert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' }) {
  return <div className={`inline-alert inline-alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>
}
