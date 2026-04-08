import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SelectContent } from '@/components/ui/select'

interface FloatingLabelSelectProps {
  label: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const FloatingLabelSelect = React.forwardRef<HTMLButtonElement, FloatingLabelSelectProps>(
  ({ label, value, onValueChange, children, className }, ref) => {
    return (
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <div className="relative">
          <SelectPrimitive.Trigger
            ref={ref}
            className={cn(
              'flex h-12 w-full items-center justify-between rounded-lg border border-input bg-background px-3 pt-4 pb-1 text-sm',
              'ring-offset-background transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              '[&>span]:line-clamp-1',
              className,
            )}
          >
            <SelectPrimitive.Value />
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <label
            className={cn(
              'pointer-events-none absolute left-2 -top-px translate-y-[-50%] px-1 text-[11px] text-muted-foreground bg-background',
            )}
          >
            {label}
          </label>
        </div>
        <SelectContent>{children}</SelectContent>
      </SelectPrimitive.Root>
    )
  },
)
FloatingLabelSelect.displayName = 'FloatingLabelSelect'

export { FloatingLabelSelect }
