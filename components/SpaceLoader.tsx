'use client'

import { motion } from 'framer-motion'

const SpaceLoader = ({ size = 100 }) => {
  const orbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  const planetVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
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

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          variants={starVariants}
          animate="animate"
        />
      ))}

      {[0.7, 0.85, 1].map((scale, index) => (
        <motion.div
          key={index}
          className="absolute border border-blue-500 rounded-full"
          style={{
            width: size * scale,
            height: size * scale,
            top: `${(1 - scale) * 50}%`,
            left: `${(1 - scale) * 50}%`,
          }}
          variants={orbitVariants}
          animate="animate"
        >
          <motion.div
            className="absolute bg-blue-400 rounded-full"
            style={{
              width: size * 0.1,
              height: size * 0.1,
              top: `-${size * 0.05}px`,
              left: `${size * scale * 0.5 - size * 0.05}px`,
            }}
            variants={planetVariants}
            animate="animate"
          />
        </motion.div>
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
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

export default SpaceLoader
