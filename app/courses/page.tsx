'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, Search, Star, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import SpaceLoader from "@/components/SpaceLoader"

interface Course {
  course_code: string
  course_name: string
  question_count: number
  weeks: string[] | null
  request_count: number
}

const ITEMS_PER_PAGE = 6

interface UnderConstructionModalProps {
  isOpen: boolean
  onClose: () => void
}

const UnderConstructionModal: React.FC<UnderConstructionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
          This course is currently under development.
        </p>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
          onClick={onClose}
        >
          Close
        </Button>
      </motion.div>
    </div>
  )
}

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false) 
  const router = useRouter()

  useEffect(() => {
    fetch('https://api.nptelprep.in/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.courses)) {
          const sortedCourses = data.courses.sort((a: Course, b: Course) => b.request_count - a.request_count)
          setCourses(sortedCourses)
          setFilteredCourses(sortedCourses)
        } else {
          console.error("API response for courses is not an array")
          setCourses([])
          setFilteredCourses([])
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching courses:', error)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    const results = courses.filter(course =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.includes(searchTerm)
    )
    setFilteredCourses(results)
    setCurrentPage(1)
  }, [searchTerm, courses])

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentCourses = filteredCourses.slice(startIndex, endIndex)

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCourseSelection = (course: Course) => {
    if (course.question_count === 0) {
      setShowModal(true) 
    } else {
      router.push(`/courses/${course.course_code}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 p-6 flex flex-col">
      <UnderConstructionModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <motion.h1
        className="text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Courses
      </motion.h1>
      <motion.div
        className="max-w-md mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 bg-opacity-50 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </motion.div>
      {isLoading ? (
        <div className="flex-grow flex justify-center items-center">
          <SpaceLoader />
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 flex-grow"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {currentCourses.map(course => (
              <motion.div
                key={course.course_code}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
                className="flex"
              >
                <Card className="bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-colors duration-300 overflow-hidden flex flex-col justify-between w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 text-blue-300">
                      <span className="flex items-center gap-2 truncate">
                        <Book className="h-6 w-6 flex-shrink-0" />
                        <span className="truncate">{course.course_name}</span>
                      </span>
                      {course.request_count > 10 && (
                        <Badge variant="secondary" className="ml-2 flex-shrink-0">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          Featured
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">Questions: {course.question_count}</p>
                    <p className="text-gray-300">Weeks: {course.weeks?.length || 0}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                      onClick={() => handleCourseSelection(course)}
                    >
                      View Portal
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
      <div className="mt-auto pt-6">
        <div className="flex justify-between items-center bg-gray-800 bg-opacity-50 p-4 rounded-lg">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
