'use client'

import { useState, useEffect } from 'react'
import { Search, Book, BarChart2, HelpCircle, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

interface Stats {
  total_courses_from_json: number
  total_assignments: number
  total_questions: number
  total_options: number
}

interface Course {
  course_code: string
  course_name: string
  question_count: number
  weeks: string[] | null
  request_count: number
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
}

const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-blue-500 rounded-full opacity-20"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 4 + 1}px`,
          height: `${Math.random() * 4 + 1}px`,
          animation: `float ${Math.random() * 10 + 5}s linear infinite`,
        }}
      />
    ))}
  </div>
)

const Logo = () => (
  <motion.div
    className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    NPTEL Quiz
  </motion.div>
)

export default function Component() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [suggestions, setSuggestions] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false)

  useEffect(() => {
    Promise.all([
      fetch('https://api.examcooker.in/courses').then(res => res.json()),
      fetch('https://api.examcooker.in/counts').then(res => res.json())
    ]).then(([coursesData, statsData]) => {
      if (Array.isArray(coursesData.courses)) {
        setCourses(coursesData.courses)
      } else {
        console.error("API response for courses is not an array")
        setCourses([])
      }

      setStats(statsData)
    }).catch(error => console.error('Error fetching data:', error))
  }, [])

  useEffect(() => {
    if (searchTerm.length > 0 && courses.length > 0) {
      const filteredCourses = courses.filter(course =>
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSuggestions(filteredCourses.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [searchTerm, courses])

  const handleCourseSelection = (course: Course) => {
    router.push(`/courses/${course.course_code}`)
  }

  const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
    <motion.div
      className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {icon}
      <h3 className="text-lg font-semibold mt-2 text-blue-300">{title}</h3>
      <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-4 relative">
      <ParticleBackground />
      <div className="w-full max-w-6xl z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Logo />
          <motion.p
            className="mt-4 text-xl text-blue-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Master Your NPTEL Course with Interactive Quizzes
          </motion.p>
        </motion.div>
        <motion.div
          className={`relative ${isSearchFocused ? 'shadow-lg shadow-blue-500/30' : ''}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Input
            type="text"
            placeholder="Search for NPTEL courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full p-4 bg-gray-800 bg-opacity-50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
          <Button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors duration-300"
            onClick={() => {/* Implement search functionality */}}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </motion.div>
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              className="mt-2 bg-gray-800 bg-opacity-75 rounded-lg overflow-hidden shadow-lg max-h-48 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.map((course, index) => (
                <motion.li
                  key={index}
                  className="p-3 hover:bg-blue-600 cursor-pointer transition-colors duration-150 flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCourseSelection(course)}
                >
                  <Book className="h-5 w-5 mr-2 text-blue-300" />
                  {course.course_name}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        {stats && (
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <StatCard
              icon={<Book className="h-10 w-10 text-blue-400" />}
              title="Total Courses"
              value={stats.total_courses_from_json}
            />
            <StatCard
              icon={<FileText className="h-10 w-10 text-green-400" />}
              title="Total Assignments"
              value={stats.total_assignments}
            />
            <StatCard
              icon={<HelpCircle className="h-10 w-10 text-yellow-400" />}
              title="Total Questions"
              value={stats.total_questions}
            />
            <StatCard
              icon={<BarChart2 className="h-10 w-10 text-purple-400" />}
              title="Total Options"
              value={stats.total_options}
            />
          </motion.div>
        )}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          </h2>
          <p className="text-xl text-blue-300 mb-8">
            Choose a course, take quizzes, and enhance your learning experience
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-blue-500/50"
            onClick={() => router.push('/courses')}
          >
            Explore Courses
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
