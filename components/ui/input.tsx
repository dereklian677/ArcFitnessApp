import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md px-3 py-1 text-sm shadow-sm transition-all duration-150',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        style={{
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
          '--tw-ring-color': 'var(--accent-violet)',
        } as React.CSSProperties}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid var(--accent-violet)'
          e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-violet)'
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid var(--border-subtle)'
          e.currentTarget.style.boxShadow = 'none'
          props.onBlur?.(e)
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
