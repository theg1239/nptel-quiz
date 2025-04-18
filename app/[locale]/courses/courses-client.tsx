'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, Search, Star, ArrowLeft, ArrowRight, Zap, Users, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Course } from '@/lib/actions'
import Logo from '@/components/Logo'

const ITEMS_PER_PAGE = 9

interface CourseCardProps {
  course: Course;
  viewMode: 'grid' | 'list';
  handleCourseSelection: (course: Course) => void;
}

const CourseCard = React.memo(({ course, viewMode, handleCourseSelection }: CourseCardProps) => {
  return (
    <Card 
      onClick={() => handleCourseSelection(course)}
      className="
        group relative overflow-hidden bg-gray-800/50 hover:bg-gray-800/70 border-gray-700/50 
        hover:border-blue-500/50 transition-all duration-300 cursor-pointer backdrop-blur-sm
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
            <Book className="h-5 w-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-gray-100 truncate group-hover:text-blue-300 transition-colors">
              {course.course_name || course.title}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 p-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-lg py-1">
            <Users className="h-4 w-4 mb-1 text-blue-400" />
            <p className="text-sm font-semibold text-gray-200">{course.request_count}</p>
            <p className="text-xs text-gray-400 hidden sm:block">Students</p>
          </div>
          <div className="flex flex-col items-center rounded-lg py-1">
            <Zap className="h-4 w-4 mb-1 text-blue-400" />
            <p className="text-sm font-semibold text-gray-200">{course.question_count}</p>
            <p className="text-xs text-gray-400 hidden sm:block">Questions</p>
          </div>
          <div className="flex flex-col items-center rounded-lg py-1">
            <Award className="h-4 w-4 mb-1 text-blue-400" />
            <p className="text-sm font-semibold text-gray-200">{course.video_count}</p>
            <p className="text-xs text-gray-400 hidden sm:block">Videos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CourseCard.displayName = 'CourseCard';

export default function CourseListClient({ initialCourses }: { initialCourses: Course[] }) {
  const [courses] = useState<Course[]>(initialCourses)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState<'popular' | 'questions'>('popular')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => {
        const matchesSearch = (course.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
      })
      .sort((a, b) => {
        if (selectedSort === 'popular') return Number(b.request_count) - Number(a.request_count)
        if (selectedSort === 'questions') return Number(b.question_count) - Number(a.question_count)
        return 0
      })
  }, [searchTerm, courses, selectedSort])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  }, [filteredCourses.length])

  const currentCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredCourses.slice(startIndex, endIndex)
  }, [filteredCourses, currentPage])

  const handleCourseSelection = useCallback((course: Course) => {
    if (Number(course.question_count) === 0) {
      setShowModal(true)
    } else {
      router.push(`/courses/${course.course_code}`)
    }
  }, [router])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedSort])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage === currentPage || isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentPage(newPage)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 200)
  }, [currentPage, isTransitioning])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        staggerChildren: 0.03,
        staggerDirection: -1,
        duration: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.2 }
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col">
      <div className="flex-none px-4 sm:px-6 lg:px-8 w-full pt-3 space-y-4">
        <div className="flex justify-center">
          <Logo />
        </div>
        
        <div className="max-w-md mx-auto w-full">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-gray-800/50 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant={selectedSort === 'popular' ? 'default' : 'ghost'}
            onClick={() => setSelectedSort('popular')}
            className="text-gray-300 w-32"
            size="sm"
          >
            <Star className="h-4 w-4 mr-2" />
            Popular
          </Button>
          <Button
            variant={selectedSort === 'questions' ? 'default' : 'ghost'}
            onClick={() => setSelectedSort('questions')}
            className="text-gray-300 w-32"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Questions
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 pb-2">
        <div className="h-full max-w-7xl mx-auto flex flex-col">
          <div className="flex-1 min-h-0 relative">
            <AnimatePresence mode="wait" initial={false} onExitComplete={() => setIsTransitioning(false)}>
              <motion.div
                key={`course-container-${currentPage}-${selectedSort}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto no-scrollbar"
              >
                {currentCourses.map(course => (
                  <motion.div
                    key={course.course_code}
                    className="h-fit"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <CourseCard 
                      course={course} 
                      viewMode="grid"
                      handleCourseSelection={handleCourseSelection}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-none pt-2">
            <div className="max-w-lg mx-auto">
              <div className="flex justify-between items-center p-2 rounded-lg backdrop-blur-sm">
                <Button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isTransitioning}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-gray-400">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0 || isTransitioning}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}