'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils/utils';

interface TooltipProps extends TooltipPrimitive.TooltipProps {}

const Tooltip = ({ children, ...props }: TooltipProps) => (
  <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
);

interface TooltipTriggerProps extends TooltipPrimitive.TooltipTriggerProps {
  children: React.ReactElement;
}

const TooltipTrigger = ({ children, ...props }: TooltipTriggerProps) => (
  <TooltipPrimitive.Trigger asChild {...props}>
    {children}
  </TooltipPrimitive.Trigger>
);

interface TooltipContentProps extends TooltipPrimitive.TooltipContentProps {
  children: React.ReactNode;
}

const TooltipContent = ({ className, children, ...props }: TooltipContentProps) => (
  <TooltipPrimitive.Content
    className={cn('rounded bg-gray-800 px-2 py-1 text-sm text-white shadow-lg', className)}
    {...props}
  >
    {children}
    <TooltipPrimitive.Arrow className="fill-gray-800" />
  </TooltipPrimitive.Content>
);

const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <TooltipPrimitive.Provider delayDuration={300}>{children}</TooltipPrimitive.Provider>
);

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
