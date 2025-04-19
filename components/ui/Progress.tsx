import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  colorClass?: string;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className, value, colorClass = 'bg-blue-600 dark:bg-blue-500', indicatorClassName, ...props },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        className={cn('relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700', className)}
        {...props}
      >
        <div
          className={cn('h-full rounded-full transition-all', colorClass, indicatorClassName)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
