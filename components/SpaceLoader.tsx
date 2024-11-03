'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const getRandomColor = () => {
  const colors = ['blue', 'purple', 'pink', 'green', 'orange', 'teal', 'yellow', 'red']
  return colors[Math.floor(Math.random() * colors.length)]
}

interface Planet {
  scale: number
  color: string
  size: number
  orbitDuration: number
  orbitDirection: number
}

interface ShootingStar {
  id: number
  x: number
  y: number
  duration: number
}

const colorClassMap: { [key: string]: string } = {
  blue: 'border-blue-500',
  purple: 'border-purple-500',
  pink: 'border-pink-500',
  green: 'border-green-500',
  orange: 'border-orange-500',
  teal: 'border-teal-500',
  yellow: 'border-yellow-500',
  red: 'border-red-500',
}

const planetBgColorMap: { [key: string]: string } = {
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  pink: 'bg-pink-400',
  green: 'bg-green-400',
  orange: 'bg-orange-400',
  teal: 'bg-teal-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
}

const SpaceLoader = ({ size = 200, showSupernova = false }: { size?: number, showSupernova?: boolean }) => {
  const [key, setKey] = useState(0) 
  const [planets, setPlanets] = useState<Planet[]>([]) 
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]) 

  useEffect(() => {
    const newPlanets: Planet[] = [0.7, 0.85, 1, 1.2].map((scale) => ({
      scale,
      color: getRandomColor(),
      size: Math.random() * 0.1 + 0.05,
      orbitDuration: Math.random() * 8 + 5,
      orbitDirection: Math.random() > 0.5 ? 1 : -1,
    }))
    setPlanets(newPlanets)
  }, [key])

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now()
      const x = Math.random() * size
      const y = Math.random() * size * 0.5 
      const duration = Math.random() * 1 + 1
      setShootingStars(prev => [...prev, { id, x, y, duration }])
    }, 1500)

    return () => clearInterval(interval)
  }, [size])

  const removeShootingStar = (id: number) => {
    setShootingStars(prev => prev.filter(star => star.id !== id))
  }

  const starVariants = {
    animate: {
      opacity: [0.2, 1, 0.2],
      scale: [0.8, 1, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const cometVariants = {
    animate: {
      x: [-size, size * 1.5],
      y: [size * 1.5, -size],
      opacity: [0, 1, 0],
      transition: {
        duration: Math.random() * 2 + 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 5
      }
    }
  }

  const supernovaVariants = {
    initial: { scale: 0, opacity: 1 },
    animate: {
      scale: [0, 5, 0],
      opacity: [1, 0.8, 0],
      transition: {
        duration: 2,
        ease: "easeInOut",
      }
    }
  }

  const shootingStarVariants = {
    initial: { opacity: 1 },
    animate: {
      x: [0, size],
      y: [0, -size * 0.5],
      opacity: [1, 0.5, 0],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      }
    }
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-800 opacity-50 blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror' }}
      />

      {[...Array(50)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          variants={starVariants}
          animate="animate"
        />
      ))}

      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`comet-${i}`}
          className="absolute bg-white rounded-full"
          style={{
            width: size * 0.02,
            height: size * 0.02,
            top: `${Math.random() * 100}%`,
            left: `-${size * 0.1}px`,
          }}
          variants={cometVariants}
          animate="animate"
        />
      ))}

      {planets.map((planet, index) => (
        <motion.div
          key={`planet-${index}`}
          className={`absolute ${colorClassMap[planet.color]} rounded-full`}
          style={{
            width: size * planet.scale,
            height: size * planet.scale,
            top: `${(1 - planet.scale) * 50}%`,
            left: `${(1 - planet.scale) * 50}%`,
          }}
          animate={{
            rotate: planet.orbitDirection * 360,
          }}
          transition={{
            duration: planet.orbitDuration,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div
            className={`absolute ${planetBgColorMap[planet.color]} rounded-full`}
            style={{
              width: size * planet.size,
              height: size * planet.size,
              top: `-${size * planet.size / 2}px`,
              left: `${size * planet.scale * 0.5 - size * planet.size / 2}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      ))}

      {shootingStars.map((star) => (
        <motion.div
          key={`shooting-star-${star.id}`}
          className="absolute bg-yellow-300 rounded-full"
          style={{
            width: size * 0.005,
            height: size * 0.005,
            top: star.y,
            left: star.x,
          }}
          variants={shootingStarVariants}
          animate="animate"
          onAnimationComplete={() => removeShootingStar(star.id)}
        />
      ))}

      <motion.div
        className="absolute bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          top: `${size * 0.4}px`,
          left: `${size * 0.4}px`,
        }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(255, 165, 0, 0.5)",
            "0 0 40px rgba(255, 165, 0, 0.7)",
            "0 0 20px rgba(255, 165, 0, 0.5)",
          ],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {showSupernova && (
        <motion.div
          className="absolute bg-white rounded-full"
          style={{
            width: size * 0.1,
            height: size * 0.1,
            top: `${size * 0.45}px`,
            left: `${size * 0.45}px`,
          }}
          variants={supernovaVariants}
          initial="initial"
          animate="animate"
        />
      )}

    </div>
  )
}

export default SpaceLoader
