'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UnderConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnderConstructionModal({ isOpen, onClose }: UnderConstructionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 max-w-md rounded-xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-400" />

        <h2 className="mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          Under Construction
        </h2>

        <p className="mb-6 text-xl text-blue-300">
          We're working on bringing you an amazing learning experience. Please check back soon!
        </p>

        <Button
          className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-colors duration-300 hover:bg-blue-700 hover:shadow-blue-500/50"
          onClick={onClose}
        >
          Got It
        </Button>
      </div>
    </div>
  );
}
