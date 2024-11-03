"use client" 

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { ArrowRight } from 'lucide-react'

interface QuizOptionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  onClick: () => void
}

const QuizOption = ({ icon: Icon, title, description, onClick }: QuizOptionProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Card className="cursor-pointer bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-300">
          <Icon className="h-6 w-6" />
          {title}
        </CardTitle>
        <CardDescription className="text-gray-300">{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onClick}>
          Start <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
)

export default QuizOption
