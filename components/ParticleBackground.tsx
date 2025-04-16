'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const ParticleBackground = () => {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    setParticles(Array.from(Array(60).keys()))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-blue-950/50 opacity-70"></div>
      
      {/* Grid lines */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Glow effect */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600 rounded-full filter blur-[120px] opacity-20"></div>
      <div className="absolute top-3/4 -right-20 w-80 h-80 bg-purple-600 rounded-full filter blur-[120px] opacity-20"></div>
      
      {/* Particles */}
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-screen"
          initial={{ 
            opacity: Math.random() * 0.3 + 0.1,
            scale: Math.random() * 0.6 + 0.4
          }}
          animate={{ 
            y: [Math.random() * 10, Math.random() * -30, Math.random() * 10],
            x: [Math.random() * 10, Math.random() * -20, Math.random() * 10],
            opacity: [0.1, Math.random() * 0.5 + 0.2, 0.1],
            scale: [Math.random() * 0.5 + 0.5, Math.random() * 1 + 0.8, Math.random() * 0.5 + 0.5]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 20 + 20,
            ease: "easeInOut"
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 1}px`,
            height: `${Math.random() * 8 + 1}px`,
            background: i % 3 === 0 
              ? 'linear-gradient(to right, #a5b4fc, #818cf8)' 
              : i % 3 === 1 
                ? 'linear-gradient(to right, #c4b5fd, #a78bfa)' 
                : 'linear-gradient(to right, #93c5fd, #60a5fa)'
          }}
        />
      ))}
    </div>
  )
}

export default ParticleBackground
