// components/UnderConstructionModal.tsx

'use client'

import { AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface UnderConstructionModalProps {
  isOpen: boolean
  onClose: () => void
}

const UnderConstructionModal: React.FC<UnderConstructionModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg text-center max-w-md mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-300 mb-2">Course Under Construction</h2>
            <p className="text-gray-300 mb-4">
              This course is currently under development. Please check back later!
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
              onClick={onClose}
            >
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UnderConstructionModal
