import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  wide?: boolean
  narrow?: boolean
  className?: string
}

export default function PageContainer({ children, wide, narrow, className }: Props) {
  return (
    <div
      className={cn(
        'mx-auto px-4 py-8 space-y-6',
        wide ? 'max-w-7xl' : narrow ? 'max-w-lg' : 'max-w-4xl',
        className,
      )}
    >
      {children}
    </div>
  )
}
