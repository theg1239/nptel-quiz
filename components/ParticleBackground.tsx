'use client'

import { useEffect, useState } from 'react'

const ParticleBackground = () => {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    setParticles(Array.from(Array(50).keys()))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((i) => (
        <div
          key={i}
          className="absolute bg-blue-500 rounded-full opacity-20 animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

export default ParticleBackground
