// components/SearchComponent.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Book } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import UnderConstructionModal from '@/components/UnderConstructionModal'

interface Course {
  course_code: string
  course_name: string
  question_count: number
  weeks: string[] | null
  request_count: number
}

interface SearchComponentProps {
  courses: Course[]
}

const SearchComponent: React.FC<SearchComponentProps> = ({ courses }) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [suggestions, setSuggestions] = useState<Course[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false)
  const [showModal, setShowModal] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 0 && courses.length > 0) {
        const filteredCourses = courses.filter(course =>
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setSuggestions(filteredCourses.slice(0, 5))
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, courses])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCourseSelection = (course: Course) => {
    if (course.question_count === 0) {
      setShowModal(true)
    } else {
      setSearchTerm('')
      setSuggestions([])
      setIsSearchFocused(false)
      router.push(`/courses/${course.course_code}`)
    }
  }

  return (
    <>
      <div
        ref={searchContainerRef}
        className={`relative ${isSearchFocused ? 'shadow-lg shadow-blue-500/30' : ''}`}
      >
        <Input
          type="text"
          placeholder="Search for NPTEL courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          className="w-full p-4 bg-gray-800 bg-opacity-50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        />
        <Button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors duration-300"
          onClick={() => {
            // Optional: Handle search button click
            if (suggestions.length > 0) {
              handleCourseSelection(suggestions[0])
            }
          }}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              className="absolute left-0 right-0 mt-2 bg-gray-800 bg-opacity-75 rounded-lg overflow-hidden shadow-lg max-h-48 overflow-y-auto z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.map((course) => (
                <motion.li
                  key={course.course_code}
                  className="p-3 hover:bg-blue-600 cursor-pointer transition-colors duration-150 flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => handleCourseSelection(course)}
                >
                  <Book className="h-5 w-5 mr-2 text-blue-300" />
                  {course.course_name}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <UnderConstructionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

export default SearchComponent
