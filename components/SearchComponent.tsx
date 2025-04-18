'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Book, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import UnderConstructionModal from '@/components/UnderConstructionModal'
import { Course } from '@/types/index'
import { LocalizedInput } from './LocalizedInput'
import { TranslatedText } from './TranslatedText'
import { useTranslator } from '@/hooks/useTranslator'

interface SearchComponentProps {
  courses: Course[]
}

const SearchComponent: React.FC<SearchComponentProps> = ({ courses }) => {
  const router = useRouter()
  const { locale } = useTranslator()
  const { isRTL, isIndicScript } = useTranslator()
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
    if (course.question_count === 0 && course.video_count === 0 && course.transcript_count === 0) {
      setShowModal(true)
    } else {
      setSearchTerm('')
      setSuggestions([])
      setIsSearchFocused(false)
      router.push(`/${locale}/courses/${course.course_code}`)
    }
  }

  const flexDirection = isRTL ? 'flex-row-reverse' : 'flex-row';
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const marginClass = isRTL ? 'ml-3' : 'mr-3';
  
  const scriptClass = isIndicScript ? 'tracking-wide' : '';

  return (
    <>
      <div ref={searchContainerRef} className="relative">
        <div className={`relative flex items-center rounded-xl overflow-hidden transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : 'ring-1 ring-white/10'}`}>
          <LocalizedInput
            type="text"
            placeholderKey="Common.searchPlaceholder"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full p-4 bg-white/5 backdrop-blur-sm border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-sm pr-28"
          />
          <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 bottom-0 flex items-center`}>
            <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 flex items-center gap-2 group hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (suggestions.length > 0) {
                  handleCourseSelection(suggestions[0])
                }
              }}
            >
              <Search className="h-5 w-5 text-white" />
              <span className="hidden sm:inline text-white font-medium">
                <TranslatedText text="Common.search" />
              </span>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isSearchFocused && suggestions.length > 0 && (
            <motion.div
              className="absolute left-0 right-0 mt-2 bg-black/40 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-white/10 z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.length === 0 ? (
                <div className="p-4 text-gray-400">
                  <TranslatedText text="Common.noResults" />
                </div>
              ) : (
                suggestions.map((course) => (
                  <motion.div
                    key={course.course_code}
                    className="border-b border-white/5 last:border-none"
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <button
                      onClick={() => handleCourseSelection(course)}
                      className={`w-full p-4 hover:bg-white/10 ${textAlign} transition-colors duration-150 flex ${flexDirection} items-center justify-between group`}
                    >
                      <div className={`flex ${flexDirection} items-center`}>
                        <div className={`p-2 ${marginClass} rounded-lg bg-indigo-500/20 text-indigo-300`}>
                          <Book className="h-5 w-5" />
                        </div>
                        <div className={scriptClass}>
                          <div className="font-medium">{course.course_name}</div>
                          <div className="text-sm text-blue-300">{course.course_code}</div>
                        </div>
                      </div>
                      <ArrowRight className={`h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UnderConstructionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

export default SearchComponent
