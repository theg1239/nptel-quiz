'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number 
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value))
    return (
      <div
        ref={ref}
        className={cn('relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full', className)}
        {...props}
      >
        <div
          className={cn('absolute top-0 left-0 h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300')}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
