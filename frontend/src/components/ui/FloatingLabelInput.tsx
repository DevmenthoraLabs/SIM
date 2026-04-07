import * as React from 'react'
import { cn } from '@/lib/utils'

interface FloatingLabelInputProps extends React.ComponentProps<'input'> {
  label: string
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, id, type, ...props }, ref) => {
    const inputId = id ?? `floating-${label.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="relative">
        <input
          id={inputId}
          type={type}
          placeholder=" "
          ref={ref}
          className={cn(
            'peer block h-12 w-full rounded-lg border border-input bg-background px-3 py-0 text-sm',
            'ring-offset-background transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground',
            'transition-all duration-150 ease-in-out',
            // when focused or filled: sit on the top border
            'peer-focus:-top-px peer-focus:translate-y-[-50%] peer-focus:left-2 peer-focus:px-1 peer-focus:text-[11px] peer-focus:text-primary peer-focus:bg-background',
            'peer-[:not(:placeholder-shown)]:-top-px peer-[:not(:placeholder-shown)]:translate-y-[-50%] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:bg-background',
          )}
        >
          {label}
        </label>
      </div>
    )
  },
)
FloatingLabelInput.displayName = 'FloatingLabelInput'

export { FloatingLabelInput }
