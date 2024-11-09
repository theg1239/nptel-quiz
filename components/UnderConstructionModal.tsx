'use client'

import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UnderConstructionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UnderConstructionModal({ isOpen, onClose }: UnderConstructionModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8 rounded-xl shadow-2xl text-center max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        
        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          Under Construction
        </h2>
        
        <p className="text-xl text-blue-300 mb-6">
          We're working on bringing you an amazing learning experience. Please check back soon!
        </p>
        
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-blue-500/50"
          onClick={onClose}
        >
          Got It
        </Button>
      </div>
    </div>
  )
}