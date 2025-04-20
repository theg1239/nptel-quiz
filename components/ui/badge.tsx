import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';

const badgeVariants = cva('inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-gray-200 text-gray-800',
      success: 'bg-green-200 text-green-800',
      warning: 'bg-yellow-200 text-yellow-800',
      danger: 'bg-red-200 text-red-800',
      secondary: 'bg-blue-200 text-blue-800',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
