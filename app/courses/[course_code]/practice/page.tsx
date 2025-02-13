'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Menu, CheckCircle2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/Progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import SpaceLoader from "@/components/SpaceLoader"
import { initializeQuestionsWithFixedOrder, Question } from '@/lib/quizUtils'

interface Week {
  name: string
  questions: Question[]
}

interface Course {
  course_code: string
  course_name: string
  question_count: number
  weeks: Week[]
  request_count: string
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
}

const sanitizeQuestion = (question: string): string => {
  return question.replace(/^(?:\d+[\.\)]?\s*)+/, '').trim()
}

const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-blue-500 rounded-full opacity-20 animate-float"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 4 + 1}px`,
          height: `${Math.random() * 4 + 1}px`,
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
    NPTEL Practice
  </motion.div>
)

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

export default function PracticeMode({ params }: { params: { course_code: string } }) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isReadAloudMode, setIsReadAloudMode] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState<number>(0)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
  }, [])

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.examcooker.in/courses/${params.course_code}`)
        if (!response.ok) {
          throw new Error('Failed to fetch course data')
        }
        const data: Course = await response.json()

        const sanitizedWeeks = data.weeks.map(week => {
          const sanitizedQuestions = week.questions
            .map(q => {
              const originalQuestion = q.question
              const sanitized = sanitizeQuestion(q.question)
              console.log(`Original: "${originalQuestion}" | Sanitized: "${sanitized}"`) 
              return {
                ...q,
                question: sanitized
              }
            })
            .filter(q => {
              const isValidQuestion = q.question.length > 0
              const hasEnoughOptions = q.options.length >= 2
              const hasAnswers = q.answer.length > 0
              if (!isValidQuestion || !hasEnoughOptions || !hasAnswers) {
                console.warn(`Invalid question found and skipped: "${q.question}"`)
                return false
              }
              return true
            })

          return {
            ...week,
            questions: sanitizedQuestions
          }
        })

        const sanitizedCourse = {
          ...data,
          weeks: sanitizedWeeks
        }

        setCourse(sanitizedCourse)
        if (sanitizedCourse.weeks.length > 0) {
          setSelectedWeek(sanitizedCourse.weeks[0].name)
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
    setCurrentSpeechIndex(0)
  }

  const currentWeekIndex = course?.weeks.findIndex(w => w.name === selectedWeek) ?? -1
  const totalWeeks = course?.weeks.length ?? 0

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!course) return
    const newIndex = direction === 'prev' ? currentWeekIndex - 1 : currentWeekIndex + 1
    if (newIndex >= 0 && newIndex < course.weeks.length) {
      setSelectedWeek(course.weeks[newIndex].name)
      setCurrentSpeechIndex(0)
    }
  }

  const sanitizedCourse = useMemo(() => {
    if (!course) return null
    const sanitizedWeeks: Week[] = course.weeks.map(week => ({
      ...week,
      questions: initializeQuestionsWithFixedOrder(week.questions)
    }))
    return {
      ...course,
      weeks: sanitizedWeeks
    }
  }, [course])

  useEffect(() => {
    if (isReadAloudMode && !loading && !error && sanitizedCourse && selectedWeek) {
      const weekQuestions = sanitizedCourse.weeks.find((week) => week.name === selectedWeek)?.questions
      if (!weekQuestions || weekQuestions.length === 0) return

      const speakQuestion = (index: number) => {
        if (!synthRef.current) return
        const question = weekQuestions[index]
        if (!question) return

        // Get the correct option(s)
        const correctOptionIndices = question.answer.map(ans => {
          const index = question.options.findIndex(option => {
            const labelMatch = option.match(/^([A-Z])[).:-]/i);
            const label = labelMatch ? labelMatch[1].toUpperCase() : '';
            return label === ans;
          });
          return index;
        });

        const correctOptionsText = correctOptionIndices.map((optionIndex) => {
          const option = question.options[optionIndex];
          const optionText = option.replace(/^([A-Z])[).:-]/i, '').trim();
          return `Option ${optionIndex + 1}: ${optionText}`;
        }).join('. ');

        const textToSpeak = `Question ${index + 1}: ${question.question}. ${correctOptionsText}.`;

        utteranceRef.current = new SpeechSynthesisUtterance(textToSpeak)
        utteranceRef.current.rate = 1.2; // Increase the rate to make it faster
        utteranceRef.current.onend = () => {
          setIsSpeaking(false)
          if (index + 1 < weekQuestions.length) {
            setCurrentSpeechIndex(index + 1)
          }
        }
        setIsSpeaking(true)
        synthRef.current.speak(utteranceRef.current)
      }

      if (!isSpeaking) {
        speakQuestion(currentSpeechIndex)
      }
    } else {
      if (synthRef.current) {
        synthRef.current.cancel()
        setIsSpeaking(false)
      }
    }
  }, [isReadAloudMode, currentSpeechIndex, sanitizedCourse, selectedWeek, loading, error, isSpeaking])

  const toggleReadAloudMode = () => {
    setIsReadAloudMode(!isReadAloudMode)
    setCurrentSpeechIndex(0)
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-gray-100 flex flex-col items-center">
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
          <Button
            variant="ghost"
            className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center"
            onClick={toggleReadAloudMode}
          >
            <Volume2 className="mr-2 h-5 w-5" />
            {isReadAloudMode ? 'Disable Read Aloud' : 'Enable Read Aloud'}
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
                {sanitizedCourse?.weeks.map((week: Week) => (
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

      <main className="flex-1 w-full max-w-4xl flex flex-col items-center px-4 md:px-6 pt-2">
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
            {selectedWeek}
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
            ) : selectedWeek && sanitizedCourse && (
              <motion.div
                key={selectedWeek}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-900 bg-opacity-50 backdrop-blur-md border-gray-800">
                  <CardContent className="pt-4">
                    {sanitizedCourse.weeks
                      .find((week) => week.name === selectedWeek)
                      ?.questions.map((question: Question, index: number) => {
                        return (
                          <div key={index} className="mb-8 last:mb-0">
                            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-100">
                              {index + 1}. {question.question} 
                            </h3>
                            <ul className="space-y-3">
                              {question.options.map((option: string, optionIndex: number) => {
                                // Extract the label from the option
                                const labelMatch = option.match(/^([A-Z])[).:-]/i);
                                const label = labelMatch ? labelMatch[1].toUpperCase() : '';
                                const isCorrect = question.answer.includes(label);

                                return (
                                  <li
                                    key={optionIndex}
                                    className={`p-3 rounded-md transition-colors ${
                                      isCorrect
                                        ? 'bg-green-800 bg-opacity-30 border border-green-600 text-green-300'
                                        : 'bg-gray-800 bg-opacity-30 border border-gray-700 hover:bg-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      {isCorrect && (
                                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-400 flex-shrink-0" />
                                      )}
                                      <span className={isCorrect ? 'text-green-300' : 'text-gray-300'}>
                                        {option}
                                      </span>
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )
                      })}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {!loading && !error && sanitizedCourse && selectedWeek && (
          <div className="mt-6 bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-800 w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-indigo-400">
                {selectedWeek && sanitizedCourse ? 
                  `${currentWeekIndex + 1} / ${totalWeeks} weeks` : 
                  '0 / 0 weeks'
                }
              </span>
            </div>
            <Progress 
              value={selectedWeek && sanitizedCourse ? 
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
