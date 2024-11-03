'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Menu, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/Progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import SpaceLoader from "@/components/SpaceLoader"

interface Question {
  question: string
  options: string[]
  answer: string[]
}

interface Week {
  name: string
  questions: Question[]
}

interface Course {
  title: string
  request_count: string
  weeks: Week[]
}

export default function PracticeMode({ params }: { params: { course_code: string } }) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNavOpen, setIsNavOpen] = useState(false)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.examcooker.in/courses/${params.course_code}`)
        if (!response.ok) {
          throw new Error('Failed to fetch course data')
        }
        const data: Course = await response.json()
        setCourse(data)
        if (data.weeks.length > 0) {
          setSelectedWeek(data.weeks[0].name)
        }
      } catch (error) {
        console.error('Error fetching course data:', error)
        setError('Failed to load course data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [params.course_code])

  const handleWeekSelect = (weekName: string) => {
    setSelectedWeek(weekName)
    setIsNavOpen(false)
  }

  const currentWeekIndex = course?.weeks.findIndex(w => w.name === selectedWeek) ?? -1
  const totalWeeks = course?.weeks.length ?? 0

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!course) return
    const newIndex = direction === 'prev' ? currentWeekIndex - 1 : currentWeekIndex + 1
    if (newIndex >= 0 && newIndex < course.weeks.length) {
      setSelectedWeek(course.weeks[newIndex].name)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-gray-100 flex flex-col items-center">
      {/* Header Section */}
      <header className="w-full max-w-4xl flex flex-col items-center p-4 md:p-6 space-y-4">
        <div className="w-full flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Quiz Portal
          </Button>
          <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Weeks</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {course?.weeks.map((week) => (
                  <Button
                    key={week.name}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleWeekSelect(week.name)}
                  >
                    {week.name}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
          {loading ? <Skeleton className="h-10 w-64" /> : 'Practice Mode'}
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center px-4 md:px-6 pt-2">
        {/* Week Navigation Buttons */}
        <div className="flex items-center justify-between mb-4 w-full">
          <Button
            variant="outline"
            onClick={() => navigateWeek('prev')}
            disabled={currentWeekIndex <= 0}
            className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous Week
          </Button>
          <span className="text-lg font-semibold text-indigo-300">
            Week {selectedWeek}
          </span>
          <Button
            variant="outline"
            onClick={() => navigateWeek('next')}
            disabled={currentWeekIndex >= totalWeeks - 1}
            className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center"
          >
            Next Week
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Content Area */}
        <ScrollArea className="h-[calc(100vh-22rem)] w-full overflow-y-auto">
  <AnimatePresence mode="wait">
    {loading ? (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center h-full"
      >
        <SpaceLoader size={100} /> 
      </motion.div>
    ) : error ? (
      <motion.div
        key="error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-pink-500 text-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg"
      >
        {error}
      </motion.div>
    ) : selectedWeek && (
              <motion.div
                key={selectedWeek}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-900 bg-opacity-50 backdrop-blur-md border-gray-800">
                  <CardContent className="pt-4">
                    {course?.weeks
                      .find((week) => week.name === selectedWeek)
                      ?.questions.map((question, index) => (
                        <div key={index} className="mb-8 last:mb-0">
                          <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-100">
                            {index + 1}. {question.question}
                          </h3>
                          <ul className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <li
                                key={optionIndex}
                                className={`p-3 rounded-md transition-colors ${
                                  question.answer.includes(option)
                                    ? 'bg-green-800 bg-opacity-30 border border-green-600 text-green-300'
                                    : 'bg-gray-800 bg-opacity-30 border border-gray-700 hover:bg-gray-700'
                                }`}
                              >
                                <div className="flex items-center">
                                  {question.answer.includes(option) && (
                                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-400 flex-shrink-0" />
                                  )}
                                  <span className={question.answer.includes(option) ? 'text-green-300' : 'text-gray-300'}>
                                    {option}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Progress Bar */}
        {!loading && !error && (
          <div className="mt-6 bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-800 w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-indigo-400">
                {selectedWeek && course ? 
                  `${currentWeekIndex + 1} / ${totalWeeks} weeks` : 
                  '0 / 0 weeks'
                }
              </span>
            </div>
            <Progress 
              value={selectedWeek && course ? 
                ((currentWeekIndex + 1) / totalWeeks) * 100 : 
                0
              } 
              className="h-2 bg-gray-700"
            />
          </div>
        )}
      </main>
    </div>
  )
}