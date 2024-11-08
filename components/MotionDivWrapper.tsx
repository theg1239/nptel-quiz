'use client'

import { motion, MotionProps } from 'framer-motion'
import React from 'react'

interface MotionDivWrapperProps extends MotionProps {
  children: React.ReactNode
  className?: string
}

const MotionDivWrapper: React.FC<MotionDivWrapperProps> = ({
  children,
  className,
  initial,
  animate,
  transition,
  ...rest
}) => (
  <motion.div
    className={className}
    initial={initial}
    animate={animate}
    transition={transition}
    {...rest}
  >
    {children}
  </motion.div>
)

export default MotionDivWrapper