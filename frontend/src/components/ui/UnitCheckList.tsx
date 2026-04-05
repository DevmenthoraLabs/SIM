import { Building2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UnitResponse } from '@/types'

interface Props {
  units: UnitResponse[]
  selected: string[]
  onToggle: (unitId: string) => void
}

export function UnitCheckList({ units, selected, onToggle }: Props) {
  return (
    <div className="grid gap-2">
      {units.map((unit) => {
        const isSelected = selected.includes(unit.id)
        return (
          <button
            key={unit.id}
            type="button"
            onClick={() => onToggle(unit.id)}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
              isSelected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-input hover:bg-muted/50',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                isSelected ? 'bg-primary/10' : 'bg-muted',
              )}
            >
              <Building2 className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('font-medium', isSelected && 'text-primary')}>{unit.name}</p>
              <p className="text-xs text-muted-foreground">{unit.code}</p>
            </div>
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input',
              )}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
