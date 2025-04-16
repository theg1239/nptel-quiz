'use client'

import { motion } from 'framer-motion'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <motion.div
    className="backdrop-blur-sm bg-white/5 border border-white/10 p-6 rounded-xl shadow-xl overflow-hidden relative group"
    whileHover={{ 
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)"
    }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full opacity-30 transition-opacity group-hover:opacity-50" />
    
    <div className="flex flex-col items-center">
      <div className="p-3 rounded-lg transition-colors">
        {icon}
      </div>
      <h3 className="text-base font-medium text-indigo-300 mb-1">{title}</h3>
      <p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
    </div>
  </motion.div>
)

export default StatCard
