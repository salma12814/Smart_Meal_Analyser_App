import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`button button-${variant} button-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="button-spinner" size={17} aria-hidden="true" /> : icon}
      {children}
    </button>
  )
}
