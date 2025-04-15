'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Book, Clock, Zap, BarChart, ArrowRight, BookOpen, Award, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"

interface Course {
  title: string
  request_count: string | number
  weeks: {
    name: string
    questions: {
      question: string
      options: string[]
      answer: string[]
    }[]
  }[]
}

interface QuizPortalProps {
  course: Course
  course_code: string
}

const VALID_QUIZ_TYPES = ["practice", "timed", "quick", "progress"]

export default function Component({ course, course_code }: QuizPortalProps = { course: { title: "Sample Course", request_count: "0", weeks: [] }, course_code: "SAMPLE101" }) {
  const router = useRouter()
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [quizTime, setQuizTime] = useState<number>(30)
  const [progress, setProgress] = useState<number>(0)

  const totalQuestions = course.weeks.reduce(
    (acc, week) => acc + week.questions.length,
    0
  )

  useEffect(() => {
    const storedProgress = JSON.parse(localStorage.getItem("courseProgress") || "{}")
    const progressPercentage = storedProgress[course_code] || 0
    setProgress(progressPercentage)
  }, [course_code, totalQuestions])

  const handleStartQuiz = () => {
    if (!VALID_QUIZ_TYPES.includes(selectedQuiz || "")) {
      console.error("Invalid quiz type selected.")
      return
    }

    let finalQuestionCount = questionCount
    let finalQuizTime = quizTime

    if (selectedQuiz === "quick") {
      finalQuestionCount = 10
      finalQuizTime = 5
    } else if (selectedQuiz === "practice") {
      finalQuestionCount = totalQuestions
      finalQuizTime = 0
    } else if (selectedQuiz === "progress") {
      finalQuestionCount = Math.min(20, totalQuestions)
      finalQuizTime = finalQuestionCount * 1
    }

    const quizSettings = {
      questionCount: finalQuestionCount,
      quizTime: finalQuizTime,
    }
    localStorage.setItem('quizSettings', JSON.stringify(quizSettings))

    const quizPath = `/courses/${course_code}/quiz/${selectedQuiz}`
    router.push(quizPath)
  }

  const handleStartPracticeMode = () => {
    router.push(`/courses/${course_code}/practice`)
  }

  const quizOptions = [
    {
      icon: Book,
      title: "Practice Quiz",
      description: "Unlimited time, all questions at your own pace",
      onClick: () => setSelectedQuiz("practice"),
    },
    {
      icon: Clock,
      title: "Timed Quiz",
      description: "Set your own time and question count",
      onClick: () => setSelectedQuiz("timed"),
    },
    {
      icon: Zap,
      title: "Quick Review",
      description: "Quick 10-question quiz with limited time",
      onClick: () => setSelectedQuiz("quick"),
    },
    {
      icon: BarChart,
      title: "Progress Test",
      description: "Focus on areas needing improvement",
      onClick: () => setSelectedQuiz("progress"),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-gray-100 flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-6xl flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/courses')}
          className="flex items-center text-violet-300 hover:bg-violet-800"
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          
        </Button>
  
        <div className="text-center flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
            {course.title}
          </h1>
          <p className="text-lg md:text-xl text-violet-300">
            Interactive Learning Portal
          </p>
        </div>
      </div>  
      
      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <Card className="bg-gray-800 bg-opacity-40 backdrop-blur-sm border-violet-700 md:col-span-2">
  <CardHeader className="pb-4"> 
    <CardTitle className="text-xl flex items-center gap-2 text-violet-300 mb-2"> 
      <Award className="h-5 w-5 text-yellow-400" />
      Your Progress
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-4 pb-6 px-4"> 
    <div className="flex justify-between mb-3 text-sm text-violet-200">
      <span>Course Completion</span>
      <span>{progress}%</span>
    </div>
    <Progress value={progress} className="h-2 bg-violet-900" colorClass="bg-violet-400" />
  </CardContent>
</Card>


        <Card className="bg-gray-800 bg-opacity-40 backdrop-blur-sm border-violet-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2 text-violet-300">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              Practice Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-violet-200 mb-3">
              Study materials and concept review.
            </p>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-sm"
              onClick={handleStartPracticeMode}
            >
              Start Practice <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 bg-opacity-40 backdrop-blur-sm border-violet-700 md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-violet-300">Quiz Options</CardTitle>
            <CardDescription className="text-sm text-violet-200">Choose your preferred quiz mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quizOptions.map((option, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-auto flex flex-col items-center p-3 bg-violet-900 bg-opacity-50 hover:bg-opacity-75 border-violet-600 text-left hover:border-violet-400"
                        onClick={option.onClick}
                      >
                        <option.icon className="h-6 w-6 mb-2 text-violet-300" />
                        <div className="text-sm font-semibold text-violet-200">{option.title}</div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-violet-800 border-violet-600 text-violet-100">
                      <p className="text-xs">{option.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {selectedQuiz && (
            <motion.div
              key="selected-quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-3"
            >
              <Card className="bg-gray-800 bg-opacity-40 backdrop-blur-sm border-violet-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-violet-300">
                    {selectedQuiz === "practice" && "Practice Quiz"}
                    {selectedQuiz === "timed" && "Timed Quiz"}
                    {selectedQuiz === "quick" && "Quick Review"}
                    {selectedQuiz === "progress" && "Progress Test"}
                  </CardTitle>
                  <CardDescription className="text-sm text-violet-200">
                    {selectedQuiz === "practice" && "All questions with unlimited time and live feedback."}
                    {selectedQuiz === "timed" && "Set your preferred quiz time and number of questions."}
                    {selectedQuiz === "quick" && "Quick 10-question quiz with 5-minute limit."}
                    {selectedQuiz === "progress" && "Focus on questions you've previously missed."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedQuiz === "timed" && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="questionCount" className="text-sm text-violet-200 block mb-1">
                          Questions (1 - {totalQuestions}):
                        </label>
                        <input
                          id="questionCount"
                          type="number"
                          min={1}
                          max={totalQuestions}
                          value={questionCount}
                          onChange={(e) => setQuestionCount(Number(e.target.value))}
                          className="w-full p-2 rounded bg-violet-900 text-violet-100 border border-violet-600 focus:border-violet-400 focus:ring focus:ring-violet-400 focus:ring-opacity-50 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="quizTime" className="text-sm text-violet-200 block mb-1">
                          Time Limit (minutes):
                        </label>
                        <input
                          id="quizTime"
                          type="number"
                          min={1}
                          value={quizTime}
                          onChange={(e) => setQuizTime(Number(e.target.value))}
                          className="w-full p-2 rounded bg-violet-900 text-violet-100 border border-violet-600 focus:border-violet-400 focus:ring focus:ring-violet-400 focus:ring-opacity-50 text-sm"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedQuiz(null)}
                      className="bg-transparent border-violet-500 text-violet-300 hover:bg-violet-900 hover:text-violet-100 text-sm"
                    >
                      Back to Options
                    </Button>
                    <Button
                      className="bg-violet-600 hover:bg-violet-700 flex items-center text-sm"
                      onClick={handleStartQuiz}
                    >
                      Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
