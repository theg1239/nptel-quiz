import { cn } from '@/lib/utils';
import React from 'react';

export function Table({ children, className }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('min-w-full divide-y divide-gray-200', className)}>{children}</table>;
}

export function TableHeader({
  children,
  className,
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-gray-50', className)}>{children}</thead>;
}

export function TableBody({ children, className }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-gray-200 bg-white', className)}>{children}</tbody>;
}

export function TableRow({ children, className }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:bg-gray-100', className)}>{children}</tr>;
}

export function TableCell({ children, className }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('whitespace-nowrap px-6 py-4 text-sm text-gray-500', className)}>
      {children}
    </td>
  );
}

export function TableHead({ children, className }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
        className
      )}
      scope="col"
    >
      {children}
    </th>
  );
}
