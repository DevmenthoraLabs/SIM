import { cn } from '@/lib/utils'

interface Props {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
}

export function StatusBadge({ active, activeLabel = 'Ativo', inactiveLabel = 'Inativo' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        active
          ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
          : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          active ? 'bg-green-500' : 'bg-red-500',
        )}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
