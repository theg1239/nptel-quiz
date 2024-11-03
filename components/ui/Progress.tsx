import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number 
  colorClass?: string 
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, colorClass = 'bg-blue-600 dark:bg-blue-500', ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value))
    return (
      <div
        ref={ref}
        className={cn('relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full', className)}
        {...props}
      >
        <div
          className={cn('absolute top-0 left-0 h-full rounded-full transition-all duration-300', colorClass)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
