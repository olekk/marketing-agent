import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'neon' | 'outline'
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-white/10 text-gray-300 border-white/10',
    success:
      'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
    neon: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.2)] hover:bg-fuchsia-500/20',
    outline: 'bg-transparent border-white/20 text-gray-400 border',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-default',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
