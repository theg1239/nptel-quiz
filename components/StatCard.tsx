'use client'

import { motion } from 'framer-motion'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <motion.div
    className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    {icon}
    <h3 className="text-lg font-semibold mt-2 text-blue-300">{title}</h3>
    <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
  </motion.div>
)

export default StatCard
