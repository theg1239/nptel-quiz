'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Menu, CheckCircle2, Volume2, BookOpen, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/Progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import SpaceLoader from "@/components/SpaceLoader"
import { initializeQuestionsWithFixedOrder, normalizeQuestion, Question } from '@/lib/quizUtils'
import { getCourse } from '@/lib/actions'

interface Week {
  name: string
  questions: Question[]
}

interface Course {
  course_code: string
  course_name: string
  question_count: number
  weeks: Week[]
  request_count: string | number
  title?: string
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
}

interface Assignment {
  questions: {
    length: number;
  }[];
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

const getLabelAndText = (option: string | { option_number: string; option_text: string }): { label: string; optionText: string } => {
  if (typeof option === 'object') {
    return {
      label: option.option_number,
      optionText: option.option_text
    };
  }
  const labelMatch = option.match(/^([A-Z])[).:-]/i);
  const label = labelMatch ? labelMatch[1].toUpperCase() : '';
  const optionText = option.replace(/^[A-Z][).:-]/i, '').trim();
  return { label, optionText };
};

export default function PracticeClient({ courseCode }: { courseCode: string }) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isReadAloudMode, setIsReadAloudMode] = useState(false)
  const [isFlashcardMode, setIsFlashcardMode] = useState(false)
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
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
        const response = await getCourse(courseCode)
        
        const sortedWeeks = response.weeks.slice().sort((a, b) => {
          const weekNumA = parseInt(a.name.match(/\d+/)?.[0] || '0')
          const weekNumB = parseInt(b.name.match(/\d+/)?.[0] || '0')
          return weekNumA - weekNumB
        })
        
        const transformedCourse: Course = {
          course_code: response.course_code,
          course_name: response.course_name,
          title: response.course_name,
          request_count: response.request_count || 0,
          question_count: response.assignments?.reduce((total: number, assignment: Assignment) => total + assignment.questions.length, 0) || 0,
          weeks: sortedWeeks.map(week => ({
            name: week.name,
            questions: week.questions.map((q: any) => {
              const partialQuestion = {
                question: typeof q === 'object' && 'question' in q ? q.question as string : '',
                question_text: typeof q === 'object' && 'question_text' in q ? q.question_text as string : '',
                content_type: typeof q === 'object' && 'content_type' in q ? q.content_type as 'mcq' | 'text' : 'mcq',
                options: Array.isArray(q.options) ? q.options : [],
                answer: Array.isArray(q.answer) ? q.answer : []
              };
              
              return normalizeQuestion({
                ...partialQuestion,
                question: partialQuestion.question || partialQuestion.question_text || '',
                question_text: partialQuestion.question_text || partialQuestion.question || '',
                content_type: partialQuestion.content_type || 'mcq'
              });
            })
          }))
        }

        const courseMetadata: {
          totalWeeks: number
          courseName: string
          lastUpdated: string
        } = {
          totalWeeks: transformedCourse.weeks.length,
          courseName: transformedCourse.course_name,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem(
          `courseData_${courseCode}`,
          JSON.stringify(courseMetadata)
        )

        setCourse(transformedCourse)
        if (transformedCourse.weeks.length > 0) {
          setSelectedWeek(transformedCourse.weeks[0].name)
        }
      } catch (error) {
        console.error('Error fetching course data:', error)
        setError('Failed to load course data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseCode])

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
    if (selectedWeek && !loading && !error) {
      try {
        const courseProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}')
        const weekProgress = JSON.parse(
          localStorage.getItem(`weekProgress_${courseCode}`) || '{}'
        )

        weekProgress[selectedWeek] = true
        localStorage.setItem(
          `weekProgress_${courseCode}`,
          JSON.stringify(weekProgress)
        )

        const totalWeeks = sanitizedCourse?.weeks.length || 0
        const viewedWeeks = Object.keys(weekProgress).length
        const viewProgress = Math.round((viewedWeeks / totalWeeks) * 40)

        const quizProgress = courseProgress[courseCode] || 0
        const weightedQuizProgress = Math.round(quizProgress * 0.6)

        const totalProgress = Math.min(
          100,
          Math.round(viewProgress + weightedQuizProgress)
        )

        courseProgress[courseCode] = totalProgress
        localStorage.setItem('courseProgress', JSON.stringify(courseProgress))
      } catch (error) {
        console.error('Error updating course progress:', error)
      }
    }
  }, [selectedWeek, courseCode, loading, error, sanitizedCourse?.weeks.length])

  const handleWeekSelect = (weekName: string) => {
    setSelectedWeek(weekName)
    setIsNavOpen(false)
    setCurrentSpeechIndex(0)
  }

  const currentWeekIndex =
    course?.weeks.findIndex(w => w.name === selectedWeek) ?? -1
  const totalWeeks = course?.weeks.length ?? 0

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!course) return
    const newIndex =
      direction === 'prev' ? currentWeekIndex - 1 : currentWeekIndex + 1
    if (newIndex >= 0 && newIndex < course.weeks.length) {
      setSelectedWeek(course.weeks[newIndex].name)
      setCurrentSpeechIndex(0)
    }
  }

  useEffect(() => {
    if (
      isReadAloudMode &&
      !loading &&
      !error &&
      sanitizedCourse &&
      selectedWeek
    ) {
      const weekQuestions = sanitizedCourse.weeks.find(
        week => week.name === selectedWeek
      )?.questions
      if (!weekQuestions || weekQuestions.length === 0) return

      const speakQuestion = (index: number) => {
        if (!synthRef.current) return
        const question = weekQuestions[index]
        if (!question) return

        const correctOptionIndices = question.answer.map(ans => {
          const idx = question.options.findIndex(option => {
            const { label } = getLabelAndText(option)
            return label === ans
          })
          return idx
        })

        const correctOptionsText = correctOptionIndices
          .map(optionIndex => {
            const option = question.options[optionIndex]
            const { optionText } = getLabelAndText(option)
            return `Option ${optionIndex + 1}: ${optionText}`
          })
          .join('. ')

        const textToSpeak = `Question ${index + 1}: ${
          question.question
        }. ${correctOptionsText}.`

        utteranceRef.current = new SpeechSynthesisUtterance(textToSpeak)
        utteranceRef.current.rate = 1.2
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
  }, [
    isReadAloudMode,
    currentSpeechIndex,
    sanitizedCourse,
    selectedWeek,
    loading,
    error,
    isSpeaking
  ])

  const toggleReadAloudMode = () => {
    setIsReadAloudMode(!isReadAloudMode)
    setCurrentSpeechIndex(0)
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleFlashcardMode = () => {
    setIsFlashcardMode(!isFlashcardMode)
    setCurrentFlashcardIndex(0)
    setIsFlipped(false)
  }

  const handleFlashcardFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const navigateFlashcard = (direction: 'prev' | 'next') => {
    if (!course || !selectedWeek) return

    const currentWeek = sanitizedCourse?.weeks.find(week => week.name === selectedWeek)
    if (!currentWeek || !currentWeek.questions.length) return

    const newIndex = direction === 'prev' 
      ? (currentFlashcardIndex - 1 + currentWeek.questions.length) % currentWeek.questions.length
      : (currentFlashcardIndex + 1) % currentWeek.questions.length
    
    setCurrentFlashcardIndex(newIndex)
    setIsFlipped(false)
  }

  const getCurrentFlashcard = () => {
    if (!sanitizedCourse || !selectedWeek) return null
    
    const currentWeek = sanitizedCourse.weeks.find(week => week.name === selectedWeek)
    if (!currentWeek || !currentWeek.questions.length) return null
    
    return currentWeek.questions[currentFlashcardIndex]
  }

  const getCorrectAnswerText = (question: Question | null): string => {
    if (!question || !question.options) return ''
    
    return question.answer.map(ans => {
      const option = question.options.find(opt => {
        const { label } = getLabelAndText(opt)
        return label === ans
      })
      
      if (!option) return ''
      
      const { optionText } = getLabelAndText(option)
      return optionText
    }).join(', ')
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
            Back to Course
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              className={`text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center ${isReadAloudMode ? 'bg-indigo-800/50' : ''}`}
              onClick={toggleReadAloudMode}
              disabled={isFlashcardMode}
            >
              <Volume2 className="mr-2 h-5 w-5" />
              {isReadAloudMode ? 'Disable Read' : 'Read Aloud'}
            </Button>
            <Button
              variant="ghost"
              className={`text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center ${isFlashcardMode ? 'bg-indigo-800/50' : ''}`}
              onClick={toggleFlashcardMode}
              disabled={isReadAloudMode}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              {isFlashcardMode ? 'Exit Flashcards' : 'Flashcards'}
            </Button>
          </div>
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
          {loading ? <Skeleton className="h-10 w-64" /> : 
            isFlashcardMode ? 'Flashcard' : 
            'Practice'}
        </h1>
      </header>

      <main className="flex-1 w-full max-w-4xl flex flex-col items-center px-4 md:px-6 pt-2">
        {isFlashcardMode && (
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
        )}

        <AnimatePresence mode="wait" initial={false}>
          {isFlashcardMode ? (
            <motion.div 
              key="flashcard-mode"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-[calc(100vh-28rem)] w-full flex flex-col items-center">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <SpaceLoader size={100} />
                  </div>
                ) : error ? (
                  <div className="text-pink-500 text-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg">
                    {error}
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center h-full">
                    <div className="flex items-center justify-between w-full mb-4">
                      <span className="text-indigo-300 text-sm">
                        Card {currentFlashcardIndex + 1} of {sanitizedCourse?.weeks.find(week => week.name === selectedWeek)?.questions.length || 0}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-pink-300 hover:text-pink-100 hover:bg-pink-900/30"
                        onClick={toggleFlashcardMode}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Exit Flashcards
                      </Button>
                    </div>
                    
                    <div className="flex-grow flex items-center justify-center w-full relative">
                      <button 
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateFlashcard('prev');
                        }}
                      >
                        <ChevronLeft className="h-6 w-6 text-white" />
                      </button>
                      
                      <motion.div 
                        className="perspective-1000 w-full max-w-lg h-[350px] cursor-pointer"
                        onClick={handleFlashcardFlip}
                        key={`${selectedWeek}-${currentFlashcardIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="w-full h-full relative preserve-3d"
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        >
                          {/* Front of card (Question) */}
                          <motion.div
                            className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-indigo-800/90 to-purple-800/90 backdrop-blur-md border border-indigo-500/30 shadow-lg p-6 flex flex-col"
                          >
                            <div className="absolute top-3 right-3 flex items-center text-xs text-indigo-300 opacity-70">
                              <span>Click to flip</span>
                              <RotateCcw className="ml-1 h-3 w-3" />
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mb-6">
                                <BookOpen className="h-8 w-8 text-indigo-300" />
                              </div>
                              <h3 className="text-xl text-center font-medium text-indigo-100 mb-4">Question</h3>
                              <p className="text-center text-lg text-gray-200 overflow-y-auto max-h-[200px] px-2">
                                {getCurrentFlashcard()?.question}
                              </p>
                            </div>
                          </motion.div>
                          
                          {/* Back of card (Answer) */}
                          <motion.div
                            className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-green-800/90 to-blue-800/90 backdrop-blur-md border border-green-500/30 shadow-lg p-6 flex flex-col"
                            style={{ transform: "rotateY(180deg)" }}
                          >
                            <div className="absolute top-3 right-3 flex items-center text-xs text-green-300 opacity-70">
                              <span>Click to flip</span>
                              <RotateCcw className="ml-1 h-3 w-3" />
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-8 w-8 text-green-300" />
                              </div>
                              <h3 className="text-xl text-center font-medium text-green-100 mb-4">Answer</h3>
                              <p className="text-center text-lg text-gray-200 overflow-y-auto max-h-[200px] px-2">
                                {getCorrectAnswerText(getCurrentFlashcard() || { options: [], answer: [], question: '', content_type: 'mcq' } as Question)}
                              </p>
                            </div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                      
                      <button 
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateFlashcard('next');
                        }}
                      >
                        <ChevronRight className="h-6 w-6 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 w-full flex justify-center">
                <span className="text-sm text-indigo-300">
                  Card {currentFlashcardIndex + 1} of {sanitizedCourse?.weeks.find(week => week.name === selectedWeek)?.questions.length || 0}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="practice-mode"
              className="w-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <ScrollArea className="h-[calc(100vh-22rem)] w-full overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <SpaceLoader size={100} />
                  </div>
                ) : error ? (
                  <div className="text-pink-500 text-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg">
                    {error}
                  </div>
                ) : selectedWeek && sanitizedCourse && (
                  <Card className="bg-gray-900 bg-opacity-50 backdrop-blur-md border-gray-800">
                    <CardContent className="pt-4">
                      {sanitizedCourse.weeks
                        .find((week) => week.name === selectedWeek)
                        ?.questions.map((question: Question, index: number) => (
                          <div key={index} className="mb-8 last:mb-0">
                            {question.content_type === 'text' ? (
                              <>
                                <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-100">
                                  {index + 1}. {question.question} 
                                </h3>
                                <div className="p-4 rounded-md bg-gray-800 bg-opacity-30 border border-gray-700 text-gray-300">
                                  <p className="whitespace-pre-line">{question.question_text || "No content available"}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-100">
                                  {index + 1}. {question.question} 
                                </h3>
                                <ul className="space-y-3">
                                  {question.options.map((option, optionIndex: number) => {
                                    const { label, optionText } = getLabelAndText(option);
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
                                            {`${label}. ${optionText}`}
                                          </span>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !error && sanitizedCourse && (
          <div className="mt-10 bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-800 w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-indigo-400">
                {`${currentWeekIndex + 1} / ${totalWeeks} weeks`}
              </span>
            </div>
            <Progress
              value={Math.round(((currentWeekIndex + 1) / totalWeeks) * 100)}
              className="h-2 bg-gray-700"
            />
          </div>
        )}
      </main>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}
